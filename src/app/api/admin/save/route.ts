import { NextResponse, type NextRequest } from "next/server";
import { GitHubError, getFile, saveFile } from "@/lib/github";
import { buildMarkdown, getCollection, slugify } from "@/lib/collections";

export const runtime = "nodejs";

/**
 * Writes a content file to GitHub — which is what "publish" means here.
 *
 * The commit triggers a Vercel redeploy, so the change is live roughly 40
 * seconds later. Nothing is stored anywhere else.
 */
export async function POST(request: NextRequest) {
  let payload: {
    collection?: string;
    slug?: string;
    frontmatter?: Record<string, unknown>;
    body?: string;
    sha?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const { collection: collectionKey, frontmatter = {}, body = "", sha } = payload;

  const collection = collectionKey ? getCollection(collectionKey) : null;
  if (!collection) {
    return NextResponse.json({ error: "Unknown content type." }, { status: 400 });
  }

  // Work out the filename. Existing entries keep theirs; new ones derive it
  // from the title, or the date for /now updates.
  let slug = payload.slug?.trim();
  if (!slug || slug === "new") {
    slug =
      collection.filename === "date"
        ? String(frontmatter.date ?? "")
        : slugify(String(frontmatter.title ?? ""));
  }

  if (!slug) {
    return NextResponse.json(
      { error: "Could not work out a filename — give this a title." },
      { status: 400 },
    );
  }

  // Guard against path traversal: a slug is a single filename, nothing else.
  if (slug.includes("/") || slug.includes("..")) {
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  }

  const filePath = `${collection.dir}/${slug}.md`;

  try {
    // Creating something new must not silently overwrite an existing file.
    const existingSha = sha;
    if (!existingSha) {
      const existing = await getFile(filePath);
      if (existing) {
        return NextResponse.json(
          { error: `"${slug}" already exists. Edit it instead, or change the title.` },
          { status: 409 },
        );
      }
    }

    const result = await saveFile({
      path: filePath,
      text: buildMarkdown(frontmatter, body),
      message: `${existingSha ? "Update" : "Add"} ${collection.label.toLowerCase()}: ${slug}`,
      sha: existingSha,
    });

    return NextResponse.json({
      ok: true,
      slug,
      sha: result.sha,
      commitUrl: result.commitUrl,
      url: collection.urls?.[slug] ?? (collection.urlBase ? `${collection.urlBase}/${slug}` : undefined),
    });
  } catch (error) {
    if (error instanceof GitHubError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save." },
      { status: 500 },
    );
  }
}
