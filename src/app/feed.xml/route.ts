import { getNowEntries, getProjects, getResearch } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/site.config";

export const dynamic = "force-static";

/** XML has five characters that must be escaped, or the feed will not parse. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type FeedItem = { title: string; url: string; description: string; date: string; category: string };

/**
 * One feed for the whole site.
 *
 * It used to carry research notes alone, which meant the thing published most
 * often — the weekly /now update — could not be followed at all. A single feed
 * rather than three: this is one person's site, and splitting a small audience
 * across separate URLs helps nobody. Each item carries a `<category>` so a
 * reader that filters still can.
 *
 * Only summaries are included, not full articles — the bodies contain rendered
 * KaTeX markup, which most feed readers strip or mangle. A link to the real
 * page is more useful than broken equations. /now entries have no `summary`
 * field, so they use the excerpt taken from their Markdown source.
 */
export async function GET() {
  const base = siteConfig.url.replace(/\/$/, "");
  const [research, projects, now] = await Promise.all([
    getResearch(),
    getProjects(),
    getNowEntries(),
  ]);

  const items: FeedItem[] = [
    ...research.map((item) => ({
      title: item.title,
      url: `${base}/research/${item.slug}`,
      description: item.summary,
      date: item.date,
      category: "research",
    })),
    ...projects.map((item) => ({
      title: item.title,
      url: `${base}/projects/${item.slug}`,
      description: item.summary,
      date: item.date,
      category: "project",
    })),
    ...now.map((item) => ({
      title: item.title ?? `Now — ${formatDate(item.date)}`,
      url: `${base}/now`,
      description: item.excerpt,
      date: item.date,
      category: "now",
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const body = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid isPermaLink="false">${item.url}#${item.date}</guid>
      <category>${item.category}</category>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${body}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
