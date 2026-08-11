import type { Metadata } from "next";
import { FilterableList } from "@/components/FilterableList";
import type { Entry } from "@/components/EntryList";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I have built.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  const entries: Entry[] = projects.map((project) => ({
    slug: project.slug,
    href: `/projects/${project.slug}`,
    title: project.title,
    summary: project.summary,
    date: project.date,
    tags: [...project.tags],
    badge: project.status === "active" ? "active" : undefined,
  }));

  return (
    <div className="container-page py-16">
      <header className="mb-8">
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Things I have built, with enough detail to judge whether they work.
        </p>
      </header>

      <FilterableList entries={entries} />
    </div>
  );
}
