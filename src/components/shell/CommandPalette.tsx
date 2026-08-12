"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaletteGroup, PaletteItem } from "@/lib/palette";
import { useWorkspaceNavigation } from "./useWorkspaceNavigation";

/** Fired by the waybar trigger and by the keyboard shortcut. */
export const PALETTE_OPEN_EVENT = "palette:open";

const GROUP_ORDER: PaletteGroup[] = ["workspaces", "projects", "research", "tags", "links"];
const GROUP_LABELS: Record<PaletteGroup, string> = {
  workspaces: "workspaces",
  projects: "projects",
  research: "research",
  tags: "tags",
  links: "links",
};

/**
 * The command palette.
 *
 * Everything in here is also reachable by clicking something visible — the
 * pills, the listings, the contact pane — so the keyboard is an enhancement,
 * never the only route. That is why every row is a real `<a href>`: middle
 * click and open-in-new-tab work, and the keyboard simply clicks the row it has
 * highlighted.
 *
 * Built on `<dialog>` rather than a hand-rolled overlay, which gets the focus
 * trap, the top layer, inertness of the page behind, and Escape-to-close from
 * the platform instead of from us.
 */
export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const go = useWorkspaceNavigation();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.group.includes(q),
    );
  }, [items, query]);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((group) => ({
        group,
        rows: matches.filter((item) => item.group === group),
      })).filter((section) => section.rows.length > 0),
    [matches],
  );

  // Flat order, so arrow keys walk across group boundaries.
  const flat = useMemo(() => grouped.flatMap((section) => section.rows), [grouped]);

  useEffect(() => {
    const open = () => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      setQuery("");
      setActive(0);
      dialog.showModal();
    };
    window.addEventListener(PALETTE_OPEN_EVENT, open);
    return () => window.removeEventListener(PALETTE_OPEN_EVENT, open);
  }, []);

  // Keep the highlighted row in view as the arrows move it.
  useEffect(() => {
    const id = rowId(flat[active]?.id);
    if (id) document.getElementById(id)?.scrollIntoView({ block: "nearest" });
  }, [active, flat]);

  function close() {
    dialogRef.current?.close();
  }

  function choose(item: PaletteItem, event?: React.MouseEvent) {
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)) return;
    event?.preventDefault();
    close();
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.group === "workspaces") go(item.href);
    else router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)) {
      event.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey)) {
      event.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = flat[active];
      if (item) choose(item);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="palette"
      aria-label="Command palette"
      onClose={() => setQuery("")}
      /* Clicking the backdrop lands on the dialog itself, never on the panel. */
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
    >
      <div className="palette-panel" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <span aria-hidden="true" className="mono text-[var(--accent)]">
            &gt;
          </span>
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder="jump to…"
            aria-label="Search"
            aria-controls="palette-list"
            aria-activedescendant={rowId(flat[active]?.id)}
            role="combobox"
            aria-expanded="true"
            className="mono h-12 w-full bg-transparent text-[var(--text)] outline-none placeholder:text-[var(--faint)] md:h-11"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="mono shrink-0 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[var(--faint)] transition-colors hover:border-[var(--border-focus)] hover:text-[var(--text-2)]"
          >
            esc
          </button>
        </div>

        <ul id="palette-list" role="listbox" aria-label="Results" className="palette-list">
          {grouped.map((section) => (
            <li key={section.group} role="presentation">
              <p className="mono px-4 pt-4 pb-1 text-[var(--dim)]">{GROUP_LABELS[section.group]}</p>
              <ul role="presentation">
                {section.rows.map((item) => {
                  const index = flat.indexOf(item);
                  const isActive = index === active;
                  return (
                    <li key={item.id} role="presentation">
                      <a
                        id={rowId(item.id)}
                        role="option"
                        aria-selected={isActive}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        onMouseEnter={() => setActive(index)}
                        onClick={(event) => choose(item, event)}
                        className={[
                          "flex items-center gap-3 px-4 py-3 transition-colors md:py-2",
                          isActive ? "bg-[var(--accent-wash)] text-[var(--text)]" : "text-[var(--text-2)]",
                        ].join(" ")}
                      >
                        <span className="truncate">
                          {item.label}
                          {item.external && <span aria-hidden="true"> ↗</span>}
                        </span>
                        {item.hint && (
                          <span className="mono ml-auto shrink-0 text-[var(--faint)]">{item.hint}</span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}

          {flat.length === 0 && (
            <li role="presentation" className="mono px-4 py-6 text-[var(--faint)]">
              no matches.
            </li>
          )}
        </ul>
      </div>
    </dialog>
  );
}

function rowId(id: string | undefined) {
  return id ? `palette-${id.replace(/[^a-z0-9]+/gi, "-")}` : undefined;
}
