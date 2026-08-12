import { Pane } from "@/components/shell/Pane";
import { getRecentActivity, getTopRepos } from "@/lib/github-activity";
import { siteConfig } from "@/site.config";
import { relativeDate } from "@/lib/utils";

/** GitHub timestamps are full ISO strings; relativeDate wants YYYY-MM-DD. */
function toDay(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Live GitHub activity, as a stack pane on `/about`.
 *
 * Renders nothing at all when the data is unavailable — no token, an outage, a
 * renamed account. That is why the pane is created here rather than by the page:
 * an absent window reads as intentional, an empty one reads as broken.
 */
export async function GitHubActivity() {
  const [repos, activity] = await Promise.all([getTopRepos(6), getRecentActivity(5)]);

  const hasRepos = repos && repos.length > 0;
  const hasActivity = activity && activity.length > 0;
  if (!hasRepos && !hasActivity) return null;

  return (
    <Pane label={`gh — ${siteConfig.githubHandle}`}>
      {hasRepos && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {repos.map((repo) => (
            <li key={repo.name}>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--inset)] p-4 transition-colors hover:border-[var(--border-focus)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="mono font-medium transition-colors group-hover:text-[var(--accent)]">
                    {repo.name}
                  </span>
                  {repo.stars > 0 && (
                    <span className="mono shrink-0 text-[var(--faint)]">★ {repo.stars}</span>
                  )}
                </div>

                {repo.description && (
                  <p className="mt-1.5 text-[length:var(--text-base)] text-[var(--muted)]">
                    {repo.description}
                  </p>
                )}

                <div className="mono mt-2 flex flex-wrap gap-x-3 text-[var(--faint)]">
                  {repo.language && <span>{repo.language}</span>}
                  <span>{relativeDate(toDay(repo.pushedAt))}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {hasActivity && (
        <div className={hasRepos ? "mt-8" : undefined}>
          <h2 className="mono text-[var(--dim)]">recent pushes</h2>
          <ul className="mono mt-3 space-y-1.5">
            {activity.map((item) => (
              <li key={item.repo} className="flex flex-wrap items-baseline justify-between gap-x-4">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent tap-target"
                >
                  {item.repo}
                </a>
                <span className="text-[var(--faint)]">
                  {item.commits > 0 && `${item.commits} commit${item.commits === 1 ? "" : "s"} · `}
                  {relativeDate(toDay(item.at))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={`https://github.com/${siteConfig.githubHandle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mono link-accent tap-target mt-6"
      >
        @{siteConfig.githubHandle} ↗
      </a>
    </Pane>
  );
}
