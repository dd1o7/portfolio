"use client";

import { useMemo, useState } from "react";
import { EntryList, type Entry } from "./EntryList";
import { cx } from "@/lib/utils";

/**
 * An entry list with tag filters above it.
 *
 * Filtering happens in the browser with no page load. Tags are derived from the
 * entries themselves, so a new tag in a Markdown file appears here automatically
 * with nothing else to update.
 */
export function FilterableList({ entries }: { entries: Entry[] }) {
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
    <>
      {tags.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
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
    </>
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
        "mono rounded-[var(--radius-sm)] border px-2 py-1 transition-colors",
        active
          ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]",
      )}
    >
      {label}
      {count !== undefined && <span className="ml-1.5 text-[var(--text-faint)]">{count}</span>}
    </button>
  );
}
