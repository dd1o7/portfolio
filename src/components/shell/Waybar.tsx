import Link from "next/link";
import { siteConfig } from "@/site.config";
import { hasResume } from "@/lib/resume";
import { WorkspacePills } from "./WorkspacePills";
import { ActiveTitle } from "./ActiveTitle";
import { PaletteTrigger } from "./PaletteTrigger";
import { Clock } from "./Clock";

/**
 * The top bar.
 *
 * Stays a server component so `hasResume()` keeps its build-time filesystem
 * check; the pills, title, palette trigger and clock each mark their own client
 * boundary.
 *
 * Space here is the scarcest thing in the design — everything but the pills and
 * the palette trigger drops away as the screen narrows, in that order.
 */
export function Waybar() {
  const showResume = hasResume();

  return (
    <header
      className={[
        "sticky top-0 z-50 flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-3",
        // 48px below md so a 44px workspace pill fits inside it with a margin;
        // the touch-target rule is what sets this floor, not the bar itself.
        "h-12 md:h-[34px]",
        // Solid below md — no backdrop-filter on mobile.
        "bg-[var(--bg)] md:bg-[var(--surface-blur)] md:backdrop-blur-md",
      ].join(" ")}
    >
      {/* Below sm the bar is workspaces and the palette only. The brand and the
          clock go first because the pills are what you navigate with, and their
          labels need the room. */}
      <Link
        href="/"
        className="mono hidden shrink-0 text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)] sm:inline"
      >
        {siteConfig.githubHandle}
      </Link>

      <span aria-hidden="true" className="hidden h-3.5 w-px shrink-0 bg-[var(--border)] sm:block" />

      <WorkspacePills />

      <div className="ml-auto flex shrink-0 items-center gap-3">
        <ActiveTitle />

        {showResume && (
          <a
            href={siteConfig.resume.path}
            target="_blank"
            rel="noopener noreferrer"
            className="mono hidden text-[var(--dim)] transition-colors hover:text-[var(--text-2)] md:inline"
          >
            cv
          </a>
        )}

        {/* The feed's only permanent home now that the footer shows keybinds.
            It is also in the palette, which is where a phone will find it. */}
        <a
          href="/feed.xml"
          className="mono hidden text-[var(--dim)] transition-colors hover:text-[var(--text-2)] md:inline"
        >
          rss
        </a>

        {/* Below md this moves to the footer — see PaletteTrigger. */}
        <PaletteTrigger className="hidden md:inline-flex" />
        <Clock />
      </div>
    </header>
  );
}
