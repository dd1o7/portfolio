import "server-only";

import { getAllTags, getProjects, getResearch, slugifyTag } from "@/lib/content";
import { hasResume } from "@/lib/resume";
import { workspaces } from "@/components/shell/workspaces";
import { contactLinks, siteConfig } from "@/site.config";

export type PaletteGroup = "workspaces" | "projects" | "research" | "tags" | "links";

export type PaletteItem = {
  id: string;
  label: string;
  /** Right-aligned secondary text: a keybind, a date, a count. */
  hint?: string;
  href: string;
  group: PaletteGroup;
  /** Leaves the site — rendered with an ↗ and opened in a new tab. */
  external?: boolean;
};

/**
 * Everything the command palette can reach.
 *
 * Built on the server from the same content the pages render, so a new project
 * or tag appears in the palette with nothing else to update. Nothing here is
 * written by hand — if a section is empty, it simply contributes no items.
 */
export async function getPaletteItems(): Promise<PaletteItem[]> {
  const [projects, research, tags] = await Promise.all([
    getProjects(),
    getResearch(),
    getAllTags(),
  ]);

  const items: PaletteItem[] = workspaces.map((workspace, index) => ({
    id: `ws:${workspace.href}`,
    label: `~/${workspace.label === "home" ? "" : workspace.label}`,
    hint: `${index + 1}`,
    href: workspace.href,
    group: "workspaces",
  }));

  for (const project of projects) {
    items.push({
      id: `project:${project.slug}`,
      label: project.title,
      hint: project.status,
      href: `/projects/${project.slug}`,
      group: "projects",
    });
  }

  for (const item of research) {
    items.push({
      id: `research:${item.slug}`,
      label: item.title,
      href: `/research/${item.slug}`,
      group: "research",
    });
  }

  for (const { tag, count } of tags) {
    items.push({
      id: `tag:${tag}`,
      label: tag,
      hint: `${count}`,
      href: `/tags/${slugifyTag(tag)}`,
      group: "tags",
    });
  }

  items.push({ id: "link:rss", label: "rss feed", href: "/feed.xml", group: "links" });

  if (hasResume()) {
    items.push({
      id: "link:cv",
      label: siteConfig.resume.label.toLowerCase(),
      href: siteConfig.resume.path,
      group: "links",
      external: true,
    });
  }

  for (const link of contactLinks()) {
    items.push({
      id: `link:${link.label}`,
      label: link.label,
      href: link.href,
      group: "links",
      external: !link.href.startsWith("mailto:"),
    });
  }

  return items;
}
