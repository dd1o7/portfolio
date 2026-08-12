import type { Metadata } from "next";
import { FilterPane } from "@/components/shell/FilterPane";
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

  return <FilterPane label="~/research" entries={entries} />;
}
