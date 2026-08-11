import { NextResponse, type NextRequest } from "next/server";
import { GitHubError, deleteFile, getFile } from "@/lib/github";
import { getCollection } from "@/lib/collections";

export const runtime = "nodejs";

/**
 * Deletes a content file.
 *
 * Safe by construction: this is a git commit, so anything removed here stays in
 * the repository history and can be restored.
 */
export async function POST(request: NextRequest) {
  let collectionKey: string | undefined;
  let slug: string | undefined;

  try {
    ({ collection: collectionKey, slug } = await request.json());
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const collection = collectionKey ? getCollection(collectionKey) : null;
  if (!collection || !slug || slug.includes("/") || slug.includes("..")) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const filePath = `${collection.dir}/${slug}.md`;

  try {
    const existing = await getFile(filePath);
    if (!existing) {
      return NextResponse.json({ error: "That file no longer exists." }, { status: 404 });
    }

    await deleteFile({
      path: filePath,
      sha: existing.sha,
      message: `Delete ${collection.label.toLowerCase()}: ${slug}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof GitHubError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
