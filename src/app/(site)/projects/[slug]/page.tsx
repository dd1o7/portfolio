import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MasterStack } from "@/components/shell/MasterStack";
import { Pane } from "@/components/shell/Pane";
import { MetaPane } from "@/components/shell/MetaPane";
import { extractHeadings, getProject, getProjects } from "@/lib/content";
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

  const links = Object.entries(project.links)
    .filter(([, url]) => Boolean(url))
    .map(([key, url]) => ({ label: LINK_LABELS[key] ?? key, href: url as string }));

  const fields = [
    { label: "date", value: formatDate(project.date) },
    {
      label: "status",
      value: (
        <span className={project.status === "active" ? "text-[var(--accent-bright)]" : undefined}>
          {project.status}
        </span>
      ),
    },
    ...(project.stack.length > 0 ? [{ label: "stack", value: project.stack.join(" · ") }] : []),
  ];

  return (
    <MasterStack
      master={
        <Pane label={`~/projects/${project.slug}.md`} focused>
          <article className="max-w-[var(--container)]">
            <Link href="/projects" className="mono link-accent tap-target">
              ← projects
            </Link>

            <h1 className="mt-5 text-[length:var(--text-2xl)] font-medium tracking-tight">
              {project.title}
            </h1>
            <p className="mt-2 text-[var(--muted)]">{project.summary}</p>

            <div
              className="prose mt-8 border-t border-[var(--border)] pt-8"
              dangerouslySetInnerHTML={{ __html: project.html }}
            />
          </article>
        </Pane>
      }
      stack={[
        <MetaPane
          key="meta"
          fields={fields}
          links={links}
          tags={project.tags}
          headings={extractHeadings(project.html)}
        />,
      ]}
    />
  );
}
