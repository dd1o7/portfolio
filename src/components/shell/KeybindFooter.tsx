import { PaletteTrigger } from "./PaletteTrigger";
import { contactLinks } from "@/site.config";

/**
 * The status line at the bottom of the shell.
 *
 * Carries two things: how to drive the site, and how to reach its owner.
 * The contact links are here on every page because a visitor with thirty
 * seconds — a recruiter, most likely — should never have to find `/about` to
 * get an email address. They are repeated in the `~/contact` pane there.
 *
 * Keybinds show at `lg` and a gesture hint below, because none of those keys
 * exist on a phone. Which one shows is CSS, not a hook — there is no behaviour
 * to gate, and the right one has to be on screen at first paint.
 */
export function KeybindFooter() {
  const links = contactLinks();

  return (
    <footer className="shrink-0 border-t border-[var(--border)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <p className="mono text-[var(--faint)] lg:hidden">swipe sideways to change workspace</p>

        <div className="mono hidden items-center gap-x-5 lg:flex">
          <Keybind keys="1–5">workspace</Keybind>
          <Keybind keys="⌘K">palette</Keybind>
          <Keybind keys="←→">resize split</Keybind>
          <Keybind keys="esc">close</Keybind>
        </div>

        <div className="mono ml-auto flex flex-wrap items-center gap-x-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="tap-target text-[var(--dim)] transition-colors hover:text-[var(--accent)]"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/feed.xml"
            className="tap-target text-[var(--dim)] transition-colors hover:text-[var(--accent)]"
          >
            rss
          </a>
          <PaletteTrigger className="inline-flex md:hidden" />
        </div>
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
