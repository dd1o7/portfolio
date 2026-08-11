import Link from "next/link";
import { EntryList, type Entry } from "@/components/EntryList";
import { getCurrentNow, getFeaturedProjects, getResearch } from "@/lib/content";
import { relativeDate } from "@/lib/utils";
import { siteConfig } from "@/site.config";

export default async function HomePage() {
  const [now, projects, research] = await Promise.all([
    getCurrentNow(),
    getFeaturedProjects(3),
    getResearch(),
  ]);

  const projectEntries: Entry[] = projects.map((p) => ({
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

  return (
    <div className="container-page py-16 sm:py-24">
      {/* Intro ---------------------------------------------------------- */}
      <section>
        <h1 className="text-[var(--text-3xl)] font-semibold tracking-tight">{siteConfig.name}</h1>
        <p className="mono mt-2 text-[var(--text-muted)]">{siteConfig.tagline}</p>
        <p className="mt-6 max-w-[38rem] text-[var(--text-md)] leading-[var(--leading-prose)]">
          {siteConfig.intro}
        </p>
      </section>

      {/* Currently ------------------------------------------------------ */}
      {now && (
        <section className="mt-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="label">Currently</h2>
            <span className="mono text-[var(--text-faint)]">{relativeDate(now.date)}</span>
          </div>
          <div
            className="prose mt-4 border-l-2 border-[var(--accent)] pl-5"
            dangerouslySetInnerHTML={{ __html: now.html }}
          />
          <Link href="/now" className="mono link-accent mt-4 inline-block">
            all updates →
          </Link>
        </section>
      )}

      {/* Projects ------------------------------------------------------- */}
      {projectEntries.length > 0 && (
        <section className="mt-16">
          <SectionHeading label="Selected projects" href="/projects" />
          <EntryList entries={projectEntries} />
        </section>
      )}

      {/* Research ------------------------------------------------------- */}
      {researchEntries.length > 0 && (
        <section className="mt-16">
          <SectionHeading label="Recent writing" href="/research" />
          <EntryList entries={researchEntries} />
        </section>
      )}
    </div>
  );
}

function SectionHeading({ label, href }: { label: string; href: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="label">{label}</h2>
      <Link href={href} className="mono link-accent">
        all →
      </Link>
    </div>
  );
}
