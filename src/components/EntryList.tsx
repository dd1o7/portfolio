import Link from "next/link";
import { formatDate } from "@/lib/utils";

export type Entry = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  /** Optional short marker shown next to the date, e.g. a project status. */
  badge?: string;
};

/**
 * The standard list of projects / research notes.
 *
 * Used on the homepage, both listing pages and tag pages, so all four stay
 * visually identical without repeating the markup.
 */
export function EntryList({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) {
    return (
      <p className="mono border-t border-[var(--border)] py-8 text-[var(--text-faint)]">
        Nothing here yet.
      </p>
    );
  }

  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.href} className="border-t border-[var(--border)]">
          <Link
            href={entry.href}
            className="group -mx-3 block rounded-[var(--radius)] px-3 py-4 transition-colors hover:bg-[var(--surface-hover)]"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-medium transition-colors group-hover:text-[var(--accent)]">
                {entry.title}
              </h3>
              <span className="mono shrink-0 text-[var(--text-faint)]">
                {entry.badge && (
                  <span className="mr-3 text-[var(--status-active)]">{entry.badge}</span>
                )}
                {formatDate(entry.date, { day: undefined })}
              </span>
            </div>

            <p className="mt-1 max-w-[36rem] text-[var(--text-sm)] text-[var(--text-muted)]">
              {entry.summary}
            </p>

            {entry.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-x-3">
                {entry.tags.map((tag) => (
                  <span key={tag} className="mono text-[var(--text-faint)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
