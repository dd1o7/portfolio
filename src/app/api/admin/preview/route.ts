import { NextResponse, type NextRequest } from "next/server";
import { renderMarkdown } from "@/lib/content";

// The Markdown pipeline (Shiki, KaTeX) is Node-only.
export const runtime = "nodejs";

/**
 * Renders Markdown for the editor's live preview.
 *
 * Deliberately reuses `renderMarkdown` from the content pipeline, so what you
 * see while writing is produced by exactly the same code as the published page.
 */
export async function POST(request: NextRequest) {
  try {
    const { markdown } = await request.json();
    if (typeof markdown !== "string") {
      return NextResponse.json({ error: "Expected a markdown string." }, { status: 400 });
    }
    return NextResponse.json({ html: await renderMarkdown(markdown) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not render preview." },
      { status: 500 },
    );
  }
}
