import { PaletteTrigger } from "./PaletteTrigger";

/**
 * The status line at the bottom of the shell.
 *
 * Desktop gets the keybinds; below `lg` it becomes a one-line gesture hint,
 * because none of those keys exist on a phone. Which one shows is CSS, not a
 * hook — there is no behaviour here to gate, and the right one has to be on
 * screen at first paint.
 *
 * Below `md` it also carries the palette trigger, which does not fit in the
 * waybar next to five workspace labels. Only shortcuts that actually work are
 * listed. This replaced `SiteFooter`, so the contact links live in `~/contact`
 * on /about and the feed lives in the waybar and the palette.
 */
export function KeybindFooter() {
  return (
    <footer className="shrink-0 border-t border-[var(--border)] px-3 py-2">
      <div className="flex items-center gap-3 lg:hidden">
        <p className="mono min-w-0 truncate text-[var(--faint)]">
          swipe sideways to change workspace
        </p>
        <PaletteTrigger className="ml-auto inline-flex md:hidden" />
      </div>

      <div className="mono hidden items-center gap-x-5 lg:flex">
        <Keybind keys="1–5">workspace</Keybind>
        <Keybind keys="⌘K">palette</Keybind>
        <Keybind keys="←→">resize split</Keybind>
        <Keybind keys="esc">close</Keybind>
      </div>
    </footer>
  );
}

function Keybind({ keys, children }: { keys: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[var(--faint)]">
      <kbd className="rounded-[var(--radius-sm)] border border-[var(--border)] px-1.5 py-0.5 text-[var(--accent-dim)] not-italic">
        {keys}
      </kbd>
      {children}
    </span>
  );
}
