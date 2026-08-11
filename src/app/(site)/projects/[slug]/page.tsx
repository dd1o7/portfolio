import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects, slugifyTag } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
}

const LINK_LABELS: Record<string, string> = {
  repo: "source",
  demo: "live demo",
  paper: "paper",
};

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const links = Object.entries(project.links).filter(([, url]) => Boolean(url));

  return (
    <article className="container-page py-16">
      <Link href="/projects" className="mono link-accent">
        ← projects
      </Link>

      <header className="mt-6">
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-2 text-[var(--text-muted)]">{project.summary}</p>

        <div className="mono mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--text-faint)]">
          <span>{formatDate(project.date)}</span>
          <span className="text-[var(--status-active)]">{project.status}</span>
          {project.stack.length > 0 && <span>{project.stack.join(" · ")}</span>}
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
        <div className="prose" dangerouslySetInnerHTML={{ __html: project.html }} />
      </div>

      {project.tags.length > 0 && (
        <footer className="hairline mt-12 pt-6">
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
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
