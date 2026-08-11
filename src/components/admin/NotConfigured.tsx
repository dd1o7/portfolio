/**
 * Shown when the GitHub environment variables are missing.
 *
 * A missing token is the most likely thing to go wrong on a first deploy, so it
 * gets a real explanation rather than a stack trace.
 */
export function NotConfigured() {
  return (
    <div className="container-page py-16">
      <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Almost there</h1>
      <p className="mt-3 max-w-prose text-[var(--text-muted)]">
        The dashboard can sign you in, but it cannot save anything yet — it does not know which
        repository to write to.
      </p>

      <div className="mt-6 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
        <p className="label">Missing environment variables</p>
        <ul className="mono mt-3 space-y-1 text-[var(--text-muted)]">
          <li>GITHUB_TOKEN</li>
          <li>GITHUB_REPO</li>
        </ul>
      </div>

      <ol className="mt-6 max-w-prose list-decimal space-y-2 pl-5 text-[var(--text-sm)]">
        <li>
          Run <code className="mono">pnpm setup</code> locally — it prints the values and the exact
          steps for creating the GitHub token.
        </li>
        <li>
          In Vercel, open <strong>Project → Settings → Environment Variables</strong> and add both.
        </li>
        <li>Redeploy. Vercel does not apply new variables to an existing deployment.</li>
      </ol>
    </div>
  );
}
