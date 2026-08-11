import Link from "next/link";
import { siteConfig } from "@/site.config";
import { hasResume } from "@/lib/resume";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  const showResume = hasResume();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-sm">
      <div className="container-wide flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="mono font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)]"
        >
          {siteConfig.name}
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mono rounded-[var(--radius-sm)] px-2 py-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}

          {showResume && (
            <a
              href={siteConfig.resume.path}
              target="_blank"
              rel="noopener noreferrer"
              className="mono rounded-[var(--radius-sm)] px-2 py-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
            >
              cv
            </a>
          )}

          <span className="ml-1">
            <ThemeToggle />
          </span>
        </nav>
      </div>
    </header>
  );
}
