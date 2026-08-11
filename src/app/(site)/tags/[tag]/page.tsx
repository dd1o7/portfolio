import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryList, type Entry } from "@/components/EntryList";
import { getAllTags, getItemsByTag, slugifyTag } from "@/lib/content";

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map(({ tag }) => ({ tag: slugifyTag(tag) }));
}

export async function generateMetadata({ params }: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}`, description: `Projects and research tagged ${tag}.` };
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
  const { tag } = await params;
  const items = await getItemsByTag(tag);
  if (items.length === 0) notFound();

  // Use the original casing from the content rather than the URL slug.
  const displayTag = items[0].tags.find((t) => slugifyTag(t) === slugifyTag(tag)) ?? tag;

  const entries: Entry[] = items.map((item) => ({
    slug: item.slug,
    href: `/${item.kind === "project" ? "projects" : "research"}/${item.slug}`,
    title: item.title,
    summary: item.summary,
    date: item.date,
    tags: [...item.tags],
    badge: item.kind === "project" ? "project" : "research",
  }));

  return (
    <div className="container-page py-16">
      <Link href="/projects" className="mono link-accent">
        ← all work
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">{displayTag}</h1>
        <p className="mono mt-2 text-[var(--text-muted)]">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </header>

      <EntryList entries={entries} />
    </div>
  );
}
