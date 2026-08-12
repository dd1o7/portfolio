import Link from "next/link";
import { collectionList } from "@/lib/collections";
import { isGitHubConfigured, listFiles } from "@/lib/github";
import { getAbout, getHome, getNowEntries, getProjects, getResearch } from "@/lib/content";
import { daysSince, relativeDate } from "@/lib/utils";
import { NotConfigured } from "@/components/admin/NotConfigured";

type Row = { slug: string; title: string; live: boolean };

/**
 * Builds the list for one collection.
 *
 * The filenames come from GitHub so anything just saved appears immediately,
 * and titles come from the built site. A file present on GitHub but not yet in
 * the build is still deploying — which is worth showing rather than hiding.
 */
async function rowsFor(dir: string, titles: Map<string, string>): Promise<Row[]> {
  const files = await listFiles(dir);
  return files
    .filter((f) => f.name.endsWith(".md"))
    .map((f) => {
      const slug = f.name.replace(/\.md$/, "");
      return { slug, title: titles.get(slug) ?? slug, live: titles.has(slug) };
    })
    .sort((a, b) => b.slug.localeCompare(a.slug));
}

export default async function AdminDashboard() {
  if (!isGitHubConfigured()) return <NotConfigured />;

  const [projects, research, now, home, about] = await Promise.all([
    getProjects(),
    getResearch(),
    getNowEntries(),
    getHome(),
    getAbout(),
  ]);

  const titlesByCollection: Record<string, Map<string, string>> = {
    pages: new Map([
      ["home", home ? "Homepage introduction" : "Homepage introduction (not created yet)"],
      ["about", about?.title ?? "About"],
    ]),
    projects: new Map(projects.map((p) => [p.slug, p.title])),
    research: new Map(research.map((r) => [r.slug, r.title])),
    now: new Map(now.map((n) => [n.slug, n.title ?? n.slug])),
  };

  let sections: { key: string; label: string; creatable: boolean; rows: Row[] }[];
  try {
    sections = await Promise.all(
      collectionList.map(async (collection) => ({
        key: collection.key,
        label: collection.labelPlural,
        creatable: collection.creatable !== false,
        rows: await rowsFor(collection.dir, titlesByCollection[collection.key] ?? new Map()),
      })),
    );
  } catch (error) {
    return (
      <div className="container-page py-16">
        <h1 className="mono text-[length:var(--text-lg)] font-medium">Could not reach GitHub</h1>
        <p className="mt-3 max-w-prose text-[var(--text-muted)]">
          {error instanceof Error ? error.message : "Unknown error."}
        </p>
      </div>
    );
  }

  const latestNow = now[0];
  const staleDays = latestNow ? daysSince(latestNow.date) : null;

  return (
    <div className="container-page py-12">
      <h1 className="text-[length:var(--text-2xl)] font-semibold tracking-tight">Dashboard</h1>

      {/* The gentle nudge: how long since the last /now update. */}
      <div className="mt-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
        {latestNow ? (
          <p className="text-[length:var(--text-sm)]">
            Last <span className="mono">/now</span> update was{" "}
            <strong>{relativeDate(latestNow.date)}</strong>
            {staleDays !== null && staleDays >= 14 && (
              <span className="text-[var(--status-draft)]"> — worth writing a new one.</span>
            )}
          </p>
        ) : (
          <p className="text-[length:var(--text-sm)]">
            No <span className="mono">/now</span> updates yet.
          </p>
        )}
        <Link href="/admin/edit/now/new" className="mono link-accent mt-2 inline-block">
          write an update →
        </Link>
      </div>

      {sections.map((section) => (
        <section key={section.key} className="mt-12">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 className="label">{section.label}</h2>
            {section.creatable && (
              <Link href={`/admin/edit/${section.key}/new`} className="mono link-accent">
                + new
              </Link>
            )}
          </div>

          {section.rows.length === 0 ? (
            <p className="mono hairline py-6 text-[var(--text-faint)]">Nothing yet.</p>
          ) : (
            <ul>
              {section.rows.map((row) => (
                <li key={row.slug} className="border-t border-[var(--border)]">
                  <Link
                    href={`/admin/edit/${section.key}/${row.slug}`}
                    className="group -mx-3 flex items-baseline justify-between gap-4 rounded-[var(--radius)] px-3 py-3 transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <span className="font-medium group-hover:text-[var(--accent)]">
                      {row.title}
                    </span>
                    <span className="mono shrink-0 text-[var(--text-faint)]">
                      {row.live ? row.slug : "publishing…"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
