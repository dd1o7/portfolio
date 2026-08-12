import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pane } from "@/components/shell/Pane";
import { MetaPane } from "@/components/shell/MetaPane";
import { getResearch, getResearchItem } from "@/lib/content";
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

  const links = Object.entries(item.links)
    .filter(([, url]) => Boolean(url))
    .map(([key, url]) => ({ label: LINK_LABELS[key] ?? key, href: url as string }));

  return (
    <>
      <Pane label={`~/research/${item.slug}.md`} focused>
        <article className="max-w-[var(--container)]">
          <Link href="/research" className="mono link-accent">
            ← research
          </Link>

          <h1 className="mt-5 text-[var(--text-2xl)] font-medium tracking-tight">{item.title}</h1>
          <p className="mt-2 text-[var(--muted)]">{item.summary}</p>

          <div
            className="prose mt-8 border-t border-[var(--border)] pt-8"
            dangerouslySetInnerHTML={{ __html: item.html }}
          />
        </article>
      </Pane>

      <MetaPane
        fields={[
          { label: "date", value: formatDate(item.date) },
          ...(item.draft ? [{ label: "status", value: "draft" }] : []),
        ]}
        links={links}
        tags={item.tags}
      />
    </>
  );
}
