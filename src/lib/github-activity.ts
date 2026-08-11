/**
 * Public GitHub activity — repositories and recent pushes.
 *
 * Read-only and used by the public site, unlike `github.ts` which is the
 * admin's write path.
 *
 * Two things worth knowing:
 *
 * 1. **Requests must be authenticated.** Unauthenticated GitHub API calls are
 *    limited to 60/hour *per IP address*, and Vercel's functions share outgoing
 *    IPs between customers — so unauthenticated calls fail unpredictably
 *    through no fault of this site. Authenticated, the limit is 5,000/hour.
 *    The same GITHUB_TOKEN the admin uses is sufficient; no extra scope needed
 *    for public data.
 *
 * 2. **Failure is never fatal.** Every function returns null rather than
 *    throwing, so a missing token or a GitHub outage hides the section instead
 *    of breaking the page.
 */

import "server-only";
import { siteConfig } from "@/site.config";

/** Refresh hourly. ISR handles this with no cron job — which matters because
 *  Vercel's Hobby plan caps cron at once per day. */
const REVALIDATE_SECONDS = 3600;

export type Repo = {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
};

export type PushActivity = {
  repo: string;
  url: string;
  commits: number;
  at: string;
};

type ApiRepo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

type ApiEvent = {
  type: string;
  repo: { name: string };
  payload: { commits?: unknown[] };
  created_at: string;
};

async function githubFetch<T>(path: string): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;

  // Without a token the request would be rate-limited per shared IP and fail
  // at random. Better to show nothing than something that works intermittently.
  if (!token) return null;

  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network failure, timeout, malformed response — all handled the same way.
    return null;
  }
}

/**
 * Most notable repositories: starred ones first, then most recently pushed.
 * Forks and archived repositories are left out — they say little about current
 * work.
 */
export async function getTopRepos(limit = 6): Promise<Repo[] | null> {
  const handle = siteConfig.githubHandle;
  if (!handle) return null;

  const repos = await githubFetch<ApiRepo[]>(
    `/users/${encodeURIComponent(handle)}/repos?sort=pushed&per_page=100&type=owner`,
  );
  if (!repos || !Array.isArray(repos)) return null;

  return repos
    .filter((repo) => !repo.fork && !repo.archived && !repo.private)
    .sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at))
    .slice(0, limit)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      pushedAt: repo.pushed_at,
    }));
}

/**
 * Recent public pushes, one row per repository.
 *
 * GitHub returns an event per push; several pushes to the same repository in
 * one day are collapsed here so the list shows breadth rather than repetition.
 */
export async function getRecentActivity(limit = 5): Promise<PushActivity[] | null> {
  const handle = siteConfig.githubHandle;
  if (!handle) return null;

  const events = await githubFetch<ApiEvent[]>(
    `/users/${encodeURIComponent(handle)}/events/public?per_page=100`,
  );
  if (!events || !Array.isArray(events)) return null;

  const byRepo = new Map<string, PushActivity>();

  for (const event of events) {
    if (event.type !== "PushEvent") continue;

    const commits = event.payload.commits?.length ?? 0;
    const existing = byRepo.get(event.repo.name);

    if (existing) {
      existing.commits += commits;
    } else {
      byRepo.set(event.repo.name, {
        repo: event.repo.name,
        url: `https://github.com/${event.repo.name}`,
        commits,
        at: event.created_at,
      });
    }
  }

  return [...byRepo.values()].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
