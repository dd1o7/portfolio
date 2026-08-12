import Link from "next/link";
import { MasterStack } from "@/components/shell/MasterStack";
import { Pane } from "@/components/shell/Pane";
import { EntryList, type Entry } from "@/components/EntryList";
import { getCurrentNow, getFeaturedProjects, getProjects, getResearch } from "@/lib/content";
import { relativeDate } from "@/lib/utils";
import { siteConfig } from "@/site.config";

/**
 * The home workspace.
 *
 * The intro is the master pane; `~/now`, `~/projects` and `~/research` tile
 * down the stack beside it. A stack pane with nothing in it is not rendered at
 * all — an empty window is worse than a missing one.
 */
export default async function HomePage() {
  const [now, featured, allProjects, research] = await Promise.all([
    getCurrentNow(),
    getFeaturedProjects(3),
    getProjects(),
    getResearch(),
  ]);

  const projectEntries: Entry[] = featured.map((p) => ({
    slug: p.slug,
    href: `/projects/${p.slug}`,
    title: p.title,
    summary: p.summary,
    date: p.date,
    tags: [...p.tags],
    badge: p.status === "active" ? "active" : undefined,
  }));

  const researchEntries: Entry[] = research.slice(0, 3).map((r) => ({
    slug: r.slug,
    href: `/research/${r.slug}`,
    title: r.title,
    summary: r.summary,
    date: r.date,
    tags: [...r.tags],
  }));

  const stack: React.ReactNode[] = [];

  if (now) {
    stack.push(
      <Pane key="now" label="~/now" counter={relativeDate(now.date)}>
        <div
          className="prose max-w-[var(--container)]"
          dangerouslySetInnerHTML={{ __html: now.html }}
        />
        <MoreLink href="/now">all updates</MoreLink>
      </Pane>,
    );
  }

  if (projectEntries.length > 0) {
    stack.push(
      <Pane
        key="projects"
        label="~/projects"
        counter={`${projectEntries.length} / ${allProjects.length}`}
      >
        <EntryList entries={projectEntries} />
        <MoreLink href="/projects">all projects</MoreLink>
      </Pane>,
    );
  }

  if (researchEntries.length > 0) {
    stack.push(
      <Pane
        key="research"
        label="~/research"
        counter={`${researchEntries.length} / ${research.length}`}
      >
        <EntryList entries={researchEntries} />
        <MoreLink href="/research">all research</MoreLink>
      </Pane>,
    );
  }

  return (
    <MasterStack
      master={
        <Pane label="~/home" focused>
          <div className="max-w-[var(--container)]">
            <h1 className="text-[length:var(--text-3xl)] font-medium tracking-tight">
              {siteConfig.name}
            </h1>
            <p className="mono mt-2 text-[var(--muted)]">{siteConfig.tagline}</p>
            <p className="mt-6 text-[length:var(--text-md)] leading-[var(--leading-prose)] text-[var(--text-2)]">
              {siteConfig.intro}
            </p>
          </div>
        </Pane>
      }
      stack={stack}
    />
  );
}

function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mono link-accent tap-target mt-5">
      {children} →
    </Link>
  );
}
