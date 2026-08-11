import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getResearch, getResearchItem, slugifyTag } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const research = await getResearch();
  return research.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/research/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = await getResearchItem(slug);
  if (!item) return {};
  return { title: item.title, description: item.summary };
}

const LINK_LABELS: Record<string, string> = {
  arxiv: "arXiv",
  pdf: "PDF",
  doi: "DOI",
  code: "code",
};

export default async function ResearchItemPage({ params }: PageProps<"/research/[slug]">) {
  const { slug } = await params;
  const item = await getResearchItem(slug);
  if (!item) notFound();

  const links = Object.entries(item.links).filter(([, url]) => Boolean(url));

  return (
    <article className="container-page py-16">
      <Link href="/research" className="mono link-accent">
        ← research
      </Link>

      <header className="mt-6">
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">{item.title}</h1>
        <p className="mt-2 text-[var(--text-muted)]">{item.summary}</p>

        <div className="mono mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--text-faint)]">
          <span>{formatDate(item.date)}</span>
          {item.draft && <span className="text-[var(--status-draft)]">draft</span>}
        </div>

        {links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {links.map(([key, url]) => (
              <a
                key={key}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="mono link-accent link-underline"
              >
                {LINK_LABELS[key] ?? key} ↗
              </a>
            ))}
          </div>
        )}
      </header>

      <div className="hairline mt-8 pt-8">
        <div className="prose" dangerouslySetInnerHTML={{ __html: item.html }} />
      </div>

      {item.tags.length > 0 && (
        <footer className="hairline mt-12 pt-6">
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${slugifyTag(tag)}`}
                className="mono rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {tag}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
