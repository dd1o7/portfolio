"use client";

import { useMemo, useState } from "react";
import { Pane } from "./Pane";
import { EntryList, type Entry } from "@/components/EntryList";
import { cx } from "@/lib/utils";

/**
 * A listing pane: tag filters above the standard entry list.
 *
 * This is a client component only so the pane's counter can track the filter —
 * `3 / 12` has to change when you click a tag, and the counter lives in the
 * pane header, above the list. Filtering itself still happens in the browser
 * with no page load, and the tags are derived from the entries, so a new tag in
 * a Markdown file appears here with nothing else to update.
 */
export function FilterPane({ label, entries }: { label: string; entries: Entry[] }) {
  const [active, setActive] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [entries]);

  const visible = useMemo(
    () => (active ? entries.filter((e) => e.tags.includes(active)) : entries),
    [entries, active],
  );

  return (
    <Pane label={label} counter={`${visible.length} / ${entries.length}`} focused>
      {tags.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <FilterChip label="all" active={active === null} onClick={() => setActive(null)} />
          {tags.map(([tag, count]) => (
            <FilterChip
              key={tag}
              label={tag}
              count={count}
              active={active === tag}
              onClick={() => setActive(active === tag ? null : tag)}
            />
          ))}
        </div>
      )}

      <EntryList entries={visible} />
    </Pane>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "mono inline-flex items-center rounded-[var(--radius-sm)] border px-3 transition-colors",
        // Deliberately small only on desktop — a 44px target below md.
        "h-11 md:h-7 md:px-2.5",
        active
          ? "border-[var(--border-focus)] bg-[var(--accent-wash)] text-[var(--accent-bright)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-focus)] hover:text-[var(--text)]",
      )}
    >
      {label}
      {count !== undefined && <span className="ml-1.5 text-[var(--faint)]">{count}</span>}
    </button>
  );
}
