import type { Metadata } from "next";
import { getNowEntries } from "@/lib/content";
import { formatDate, relativeDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Now",
  description: "What I am working on at the moment.",
};

export default async function NowPage() {
  const entries = await getNowEntries();
  const [current, ...past] = entries;

  return (
    <div className="container-page py-16">
      <header className="mb-8">
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">Now</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          What I am working on at the moment, updated most weeks.
        </p>
      </header>

      {!current && (
        <p className="mono hairline py-8 text-[var(--text-faint)]">No updates yet.</p>
      )}

      {current && (
        <section className="hairline pt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="label">{current.title ?? "Currently"}</h2>
            <span className="mono text-[var(--text-faint)]">
              {formatDate(current.date)} · {relativeDate(current.date)}
            </span>
          </div>
          <div
            className="prose mt-4 border-l-2 border-[var(--accent)] pl-5"
            dangerouslySetInnerHTML={{ __html: current.html }}
          />
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-16">
          <h2 className="label mb-2">Previously</h2>
          {past.map((entry) => (
            <article key={entry.slug} className="hairline py-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="mono font-medium">{entry.title ?? formatDate(entry.date)}</h3>
                <span className="mono text-[var(--text-faint)]">{relativeDate(entry.date)}</span>
              </div>
              <div
                className="prose mt-3 text-[var(--text-muted)]"
                dangerouslySetInnerHTML={{ __html: entry.html }}
              />
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
