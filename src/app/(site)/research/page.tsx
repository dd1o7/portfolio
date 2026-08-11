import type { Metadata } from "next";
import { FilterableList } from "@/components/FilterableList";
import type { Entry } from "@/components/EntryList";
import { getResearch } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research",
  description: "Notes, paper reactions and writeups.",
};

export default async function ResearchPage() {
  const research = await getResearch();

  const entries: Entry[] = research.map((item) => ({
    slug: item.slug,
    href: `/research/${item.slug}`,
    title: item.title,
    summary: item.summary,
    date: item.date,
    tags: [...item.tags],
  }));

  return (
    <div className="container-page py-16">
      <header className="mb-8">
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Research</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Notes, paper reactions and writeups — mostly unfinished by design.
        </p>
      </header>

      <FilterableList entries={entries} />
    </div>
  );
}
