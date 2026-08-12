import type { Metadata } from "next";
import { FilterPane } from "@/components/shell/FilterPane";
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

  return <FilterPane label="~/projects" entries={entries} />;
}
