import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Admin",
  // Keep the dashboard out of search results.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The admin is always rendered fresh — it reads live state from GitHub, so a
 * cached copy would show stale content right after you save something.
 */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const signedIn = await verifySessionToken(token);

  // The login page gets no chrome — there is nothing to navigate to yet.
  if (!signedIn) return <main className="flex-1">{children}</main>;

  return (
    <>
      <header className="border-b border-[var(--border)]">
        <div className="container-wide flex h-14 items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <Link href="/admin" className="mono font-medium hover:text-[var(--accent)]">
              admin
            </Link>
            <Link
              href="/"
              target="_blank"
              className="mono text-[var(--text-faint)] hover:text-[var(--text)]"
            >
              view site ↗
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </>
  );
}
