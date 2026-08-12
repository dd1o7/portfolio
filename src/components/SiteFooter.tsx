import { contactLinks, siteConfig } from "@/site.config";

/** Replaced by the keybind footer in Phase 6; the links live in `~/contact` too. */
export function SiteFooter() {
  const links = contactLinks();

  return (
    <footer className="border-t border-[var(--border)] px-3 py-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="mono tap-target text-[var(--dim)] transition-colors hover:text-[var(--accent)]"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/feed.xml"
            className="mono tap-target text-[var(--dim)] transition-colors hover:text-[var(--accent)]"
          >
            rss
          </a>
        </div>
        <p className="mono text-[var(--faint)]">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
