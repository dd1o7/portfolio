import { getRecentActivity, getTopRepos } from "@/lib/github-activity";
import { siteConfig } from "@/site.config";
import { relativeDate } from "@/lib/utils";

/** GitHub timestamps are full ISO strings; relativeDate wants YYYY-MM-DD. */
function toDay(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Live GitHub activity.
 *
 * Renders nothing at all when the data is unavailable — no token, an outage, a
 * renamed account. An absent section reads as intentional; a broken one does
 * not.
 */
export async function GitHubActivity() {
  const [repos, activity] = await Promise.all([getTopRepos(6), getRecentActivity(5)]);

  const hasRepos = repos && repos.length > 0;
  const hasActivity = activity && activity.length > 0;
  if (!hasRepos && !hasActivity) return null;

  return (
    <section className="hairline mt-14 pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="label">On GitHub</h2>
        <a
          href={`https://github.com/${siteConfig.githubHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mono link-accent"
        >
          @{siteConfig.githubHandle} ↗
        </a>
      </div>

      {hasRepos && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {repos.map((repo) => (
            <li key={repo.name}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full rounded-[var(--radius)] border border-[var(--border)] p-4 transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="mono font-medium transition-colors group-hover:text-[var(--accent)]">
                    {repo.name}
                  </span>
                  {repo.stars > 0 && (
                    <span className="mono shrink-0 text-[var(--text-faint)]">★ {repo.stars}</span>
                  )}
                </div>

                {repo.description && (
                  <p className="mt-1.5 text-[var(--text-sm)] text-[var(--text-muted)]">
                    {repo.description}
                  </p>
                )}

                <div className="mono mt-2 flex flex-wrap gap-x-3 text-[var(--text-faint)]">
                  {repo.language && <span>{repo.language}</span>}
                  <span>{relativeDate(toDay(repo.pushedAt))}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {hasActivity && (
        <div className="mt-8">
          <h3 className="label">Recent pushes</h3>
          <ul className="mono mt-3 space-y-1.5">
            {activity.map((item) => (
              <li key={item.repo} className="flex flex-wrap items-baseline justify-between gap-x-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent"
                >
                  {item.repo}
                </a>
                <span className="text-[var(--text-faint)]">
                  {item.commits > 0 && `${item.commits} commit${item.commits === 1 ? "" : "s"} · `}
                  {relativeDate(toDay(item.at))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
