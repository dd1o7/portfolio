import Link from "next/link";
import { AmbientBackground } from "@/components/shell/AmbientBackground";
import { Pane } from "@/components/shell/Pane";
import { siteConfig } from "@/site.config";

/**
 * Lives at the app root rather than inside `(site)`, so it also covers unmatched
 * URLs that belong to no route group. That means it renders without the waybar,
 * hence the explicit links back.
 */
export default function NotFound() {
  return (
    <>
      <AmbientBackground />
      <main className="flex flex-1 flex-col p-3">
        <Pane label="~/404" focused>
          <p className="mono text-[var(--faint)]">404</p>
          <h1 className="mt-3 text-[var(--text-2xl)] font-medium tracking-tight">Page not found</h1>
          <p className="mt-2 max-w-prose text-[var(--muted)]">
            That page does not exist — it may have been renamed or removed.
          </p>

          <nav aria-label="Workspaces" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className="mono link-accent">
              home
            </Link>
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href} className="mono link-accent">
                {item.label}
              </Link>
            ))}
          </nav>
        </Pane>
      </main>
    </>
  );
}
