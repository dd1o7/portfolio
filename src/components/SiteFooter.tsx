import { siteConfig } from "@/site.config";

/** Only links with a value are shown, so unused ones can stay empty in config. */
function contactLinks() {
  const { email, github, linkedin, x, scholar } = siteConfig.links;
  return [
    email && { label: "email", href: `mailto:${email}` },
    github && { label: "github", href: github },
    linkedin && { label: "linkedin", href: linkedin },
    x && { label: "x", href: x },
    scholar && { label: "scholar", href: scholar },
  ].filter(Boolean) as { label: string; href: string }[];
}

export function SiteFooter() {
  const links = contactLinks();

  return (
    <footer className="mt-24 border-t border-[var(--border)] py-8">
      <div className="container-wide flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="mono text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="mono text-[var(--text-faint)]">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
