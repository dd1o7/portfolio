import { siteConfig } from "@/site.config";

/**
 * Workspace order. Real routes, in a fixed order.
 *
 * This array is the single source of truth for "which way is forward": the
 * pills number themselves from it, the mobile swiper steps through it, and
 * Phase 4 derives the slide direction from comparing two indices in it.
 */
export const workspaces = [
  { href: "/", label: "home" },
  ...siteConfig.nav.map((item) => ({ href: item.href, label: item.label })),
];

/** True when `href` is the workspace the current URL belongs to. */
export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * Which workspace the current URL sits in.
 *
 * Routes that belong to no workspace — `/tags/…`, a 404 — report 0, so swiping
 * from one lands somewhere sensible rather than doing nothing.
 */
export function activeIndex(pathname: string): number {
  const index = workspaces.findIndex((workspace) => isActive(pathname, workspace.href));
  return index === -1 ? 0 : index;
}
