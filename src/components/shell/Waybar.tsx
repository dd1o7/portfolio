import Link from "next/link";
import { siteConfig } from "@/site.config";
import { hasResume } from "@/lib/resume";
import { WorkspacePills } from "./WorkspacePills";
import { Clock } from "./Clock";

/**
 * The top bar.
 *
 * Stays a server component so `hasResume()` keeps its build-time filesystem
 * check; only the pills and the clock need the browser, and each marks its own
 * client boundary.
 *
 * The active-window title and the command palette trigger belong here too, but
 * arrive in Phase 6 with the palette itself.
 */
export function Waybar() {
  const showResume = hasResume();

  return (
    <header
      className={[
        "sticky top-0 z-50 flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-3",
        "h-11 md:h-[34px]",
        // Solid below md — no backdrop-filter on mobile.
        "bg-[var(--bg)] md:bg-[var(--surface-blur)] md:backdrop-blur-md",
      ].join(" ")}
    >
      <Link
        href="/"
        className="mono shrink-0 text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]"
      >
        {siteConfig.githubHandle}
      </Link>

      <span aria-hidden="true" className="h-3.5 w-px shrink-0 bg-[var(--border)]" />

      <WorkspacePills />

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {showResume && (
          <a
            href={siteConfig.resume.path}
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[var(--dim)] transition-colors hover:text-[var(--text-2)] max-md:hidden"
          >
            cv
          </a>
        )}
        <Clock />
      </div>
    </header>
  );
}
