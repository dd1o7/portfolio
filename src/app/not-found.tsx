import Link from "next/link";
import { siteConfig } from "@/site.config";

/**
 * Lives at the app root rather than inside `(site)`, so it also covers unmatched
 * URLs that belong to no route group. That means it renders without the site
 * header, hence the explicit link back.
 */
export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="label">404</p>
      <h1 className="mt-3 text-[var(--text-2xl)] font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-prose text-[var(--text-muted)]">
        That page does not exist — it may have been renamed or removed.
      </p>

      <nav className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2">
        <Link href="/" className="mono link-accent">
          home
        </Link>
        {siteConfig.nav.map((item) => (
          <Link key={item.href} href={item.href} className="mono link-accent">
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
