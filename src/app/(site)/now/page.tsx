import type { Metadata } from "next";
import { Pane } from "@/components/shell/Pane";
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
    <>
      <Pane
        label="~/now"
        counter={current ? `${formatDate(current.date)} · ${relativeDate(current.date)}` : undefined}
        focused
      >
        {current ? (
          <div
            className="prose max-w-[var(--container)]"
            dangerouslySetInnerHTML={{ __html: current.html }}
          />
        ) : (
          <p className="mono text-[var(--faint)]">no updates yet.</p>
        )}
      </Pane>

      {past.length > 0 && (
        <Pane label="~/now/archive" counter={`${past.length}`}>
          <div className="max-w-[var(--container)]">
            {past.map((entry) => (
              <article key={entry.slug} className="border-t border-[var(--border)] py-6 first:border-t-0 first:pt-0">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="mono font-medium">{entry.title ?? formatDate(entry.date)}</h2>
                  <span className="mono shrink-0 text-[var(--faint)]">
                    {relativeDate(entry.date)}
                  </span>
                </div>
                <div
                  className="prose mt-3 text-[var(--muted)]"
                  dangerouslySetInnerHTML={{ __html: entry.html }}
                />
              </article>
            ))}
          </div>
        </Pane>
      )}
    </>
  );
}
