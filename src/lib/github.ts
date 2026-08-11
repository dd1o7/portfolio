/**
 * GitHub Contents API — the write path for the admin dashboard.
 *
 * The admin reads and writes content through this rather than the local
 * filesystem. On Vercel the filesystem is a snapshot from the last build, so a
 * file you just saved would not appear until the redeploy finished. Going
 * through the API means the dashboard always shows the true current state.
 *
 * Every function here is server-only. The token must never reach the browser.
 */

import "server-only";

const API = "https://api.github.com";

type RepoConfig = { owner: string; repo: string; branch: string; token: string };

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

function config(): RepoConfig {
  const token = process.env.GITHUB_TOKEN;
  const repoSlug = process.env.GITHUB_REPO;

  if (!token) {
    throw new GitHubError("GITHUB_TOKEN is not set. Run `pnpm setup` and add it in Vercel.");
  }
  if (!repoSlug?.includes("/")) {
    throw new GitHubError('GITHUB_REPO must look like "username/repository".');
  }

  const [owner, repo] = repoSlug.split("/");
  return { owner, repo, branch: process.env.GITHUB_BRANCH || "main", token };
}

/** True when the admin has everything it needs to talk to GitHub. */
export function isGitHubConfigured(): boolean {
  try {
    config();
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = config();

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new GitHubError(friendlyError(res.status, body), res.status);
  }

  return res.json() as Promise<T>;
}

/** Turn GitHub's API errors into something actionable. */
function friendlyError(status: number, body: string): string {
  switch (status) {
    case 401:
      return "GitHub rejected the token. It may have been revoked or mistyped — generate a new one and update GITHUB_TOKEN.";
    case 403:
      return "GitHub refused the request. The token probably lacks Contents: Read and write on this repository.";
    case 404:
      return "Not found. Check GITHUB_REPO names an existing repository the token can access.";
    case 409:
      return "This file changed since you opened it. Reload the page and reapply your edit.";
    case 422:
      return `GitHub rejected the content: ${body.slice(0, 200)}`;
    default:
      return `GitHub returned ${status}: ${body.slice(0, 200)}`;
  }
}

function contentsUrl(filePath: string): string {
  const { owner, repo } = config();
  const encoded = filePath.split("/").map(encodeURIComponent).join("/");
  return `/repos/${owner}/${repo}/contents/${encoded}`;
}

/* ==========================================================================
   Reads
   ========================================================================== */

type ContentEntry = { name: string; path: string; sha: string; type: "file" | "dir" };

/** List the files in a directory. Returns [] if the directory does not exist. */
export async function listFiles(dir: string): Promise<ContentEntry[]> {
  const { branch } = config();
  try {
    const entries = await request<ContentEntry[]>(`${contentsUrl(dir)}?ref=${branch}`);
    return Array.isArray(entries) ? entries.filter((e) => e.type === "file") : [];
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return [];
    throw error;
  }
}

/**
 * Read a file's text and its SHA.
 *
 * The SHA is required to update the file later — GitHub uses it to detect that
 * someone else changed the file in the meantime.
 */
export async function getFile(filePath: string): Promise<{ text: string; sha: string } | null> {
  const { branch } = config();
  try {
    const file = await request<{ content: string; sha: string; encoding: string }>(
      `${contentsUrl(filePath)}?ref=${branch}`,
    );
    return {
      text: Buffer.from(file.content, "base64").toString("utf8"),
      sha: file.sha,
    };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

/* ==========================================================================
   Writes — each one is a commit
   ========================================================================== */

/** Create or update a text file. Omit `sha` to create, pass it to update. */
export async function saveFile(opts: {
  path: string;
  text: string;
  message: string;
  sha?: string;
}): Promise<{ sha: string; commitUrl: string }> {
  const { branch } = config();

  const result = await request<{ content: { sha: string }; commit: { html_url: string } }>(
    contentsUrl(opts.path),
    {
      method: "PUT",
      body: JSON.stringify({
        message: opts.message,
        content: Buffer.from(opts.text, "utf8").toString("base64"),
        branch,
        ...(opts.sha ? { sha: opts.sha } : {}),
      }),
    },
  );

  return { sha: result.content.sha, commitUrl: result.commit.html_url };
}

/** Upload an already-base64-encoded binary file, such as an image. */
export async function saveBinary(opts: {
  path: string;
  base64: string;
  message: string;
  sha?: string;
}): Promise<{ sha: string }> {
  const { branch } = config();

  const result = await request<{ content: { sha: string } }>(contentsUrl(opts.path), {
    method: "PUT",
    body: JSON.stringify({
      message: opts.message,
      content: opts.base64,
      branch,
      ...(opts.sha ? { sha: opts.sha } : {}),
    }),
  });

  return { sha: result.content.sha };
}

export async function deleteFile(opts: {
  path: string;
  sha: string;
  message: string;
}): Promise<void> {
  const { branch } = config();
  await request(contentsUrl(opts.path), {
    method: "DELETE",
    body: JSON.stringify({ message: opts.message, sha: opts.sha, branch }),
  });
}
