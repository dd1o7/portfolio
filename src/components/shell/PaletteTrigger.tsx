"use client";

import { PALETTE_OPEN_EVENT } from "./CommandPalette";

/**
 * The visible way into the palette.
 *
 * Keyboard shortcuts are desktop-only and an enhancement, so this button exists
 * at every width — on a phone it is the only way in, and it must be. Below `md`
 * it lives in the footer rather than the waybar: five workspace labels and a
 * 44px button do not both fit a 320px bar, and the pills win.
 *
 * The sizing is deliberately plain Tailwind rather than the `.tap-target`
 * class, because that class is unlayered and would beat a `hidden` utility —
 * see the cascade note in CLAUDE.md.
 */
export function PaletteTrigger({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(PALETTE_OPEN_EVENT))}
      aria-label="Open command palette"
      aria-keyshortcuts="Meta+K Control+K"
      className={[
        "mono shrink-0 items-center justify-center rounded-[var(--radius-sm)] border",
        "border-[var(--border)] px-2 text-[var(--dim)] transition-colors",
        "hover:border-[var(--border-focus)] hover:text-[var(--text-2)]",
        "min-h-11 min-w-11 md:h-[22px] md:min-h-0 md:min-w-0",
        className,
      ].join(" ")}
    >
      <span aria-hidden="true" className="md:hidden">
        find
      </span>
      <span aria-hidden="true" className="hidden md:inline">
        ⌘k
      </span>
    </button>
  );
}
