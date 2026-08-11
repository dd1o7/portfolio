import { NextResponse, type NextRequest } from "next/server";
import { GitHubError, saveBinary } from "@/lib/github";
import { slugify } from "@/lib/collections";

export const runtime = "nodejs";

/** Generous ceiling — the browser resizes images well below this first. */
const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

/**
 * Commits an image to `public/images/`.
 *
 * The browser resizes and re-encodes before uploading (see MarkdownEditor), so
 * what arrives here is already small. The size check is a backstop.
 */
export async function POST(request: NextRequest) {
  let filename: string | undefined;
  let dataUrl: string | undefined;

  try {
    ({ filename, dataUrl } = await request.json());
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!filename || !dataUrl) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const base64 = dataUrl.split(",")[1];
  if (!base64) {
    return NextResponse.json({ error: "Could not read the image data." }, { status: 400 });
  }

  const bytes = Math.floor((base64.length * 3) / 4);
  if (bytes > MAX_BYTES) {
    return NextResponse.json(
      { error: `That image is ${(bytes / 1024 / 1024).toFixed(1)} MB — the limit is 4 MB.` },
      { status: 413 },
    );
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.has(ext)) {
    return NextResponse.json(
      { error: `Cannot upload .${ext} files. Use jpg, png, webp, gif or svg.` },
      { status: 400 },
    );
  }

  // Prefix with the date so repeated uploads of "screenshot.png" never collide.
  const stem = slugify(filename.replace(/\.[^.]+$/, "")) || "image";
  const safeName = `${new Date().toISOString().slice(0, 10)}-${stem}.${ext}`;
  const filePath = `public/images/${safeName}`;

  try {
    await saveBinary({ path: filePath, base64, message: `Add image: ${safeName}` });
    // The public URL drops the `public/` prefix.
    return NextResponse.json({ ok: true, url: `/images/${safeName}` });
  } catch (error) {
    if (error instanceof GitHubError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }
    return NextResponse.json({ error: "Could not upload." }, { status: 500 });
  }
}
