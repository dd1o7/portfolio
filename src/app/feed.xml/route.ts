import { getResearch } from "@/lib/content";
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

/**
 * RSS feed for research notes, so people can follow new writing without
 * checking the site.
 *
 * Only summaries are included, not full articles — the bodies contain rendered
 * KaTeX markup, which most feed readers strip or mangle. A link to the real
 * page is more useful than broken equations.
 */
export async function GET() {
  const base = siteConfig.url.replace(/\/$/, "");
  const research = await getResearch();

  const items = research
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${base}/research/${item.slug}</link>
      <guid isPermaLink="true">${base}/research/${item.slug}</guid>
      <description>${escapeXml(item.summary)}</description>
      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} — Research</title>
    <link>${base}/research</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
