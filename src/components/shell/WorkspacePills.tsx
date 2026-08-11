"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/site.config";

/**
 * Workspace order. Real routes, in a fixed order — Phase 4 derives the slide
 * direction from index comparison here, so this array is the single source of
 * truth for "which way is forward".
 */
export const workspaces = [
  { href: "/", label: "home" },
  ...siteConfig.nav.map((item) => ({ href: item.href, label: item.label })),
];

/** True when `href` is the workspace the current URL belongs to. */
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * The nav.
 *
 * These are real links, not client state — the route owns which workspace is
 * active, and `usePathname()` only reads it. Never mirror it into React state.
 */
export function WorkspacePills() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspaces"
      /* Scrolls sideways rather than wrapping. A second row would push the
         waybar off its fixed height. */
      className="flex min-w-0 flex-nowrap items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {workspaces.map((workspace, index) => {
        const active = isActive(pathname, workspace.href);

        return (
          <Link
            key={workspace.href}
            href={workspace.href}
            aria-current={active ? "page" : undefined}
            className={[
              "mono flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5",
              "h-8 leading-none transition-colors md:h-[22px]",
              active
                ? "border-[var(--border-focus)] bg-[var(--accent-wash)] text-[var(--accent-bright)]"
                : "border-transparent text-[var(--dim)] hover:border-[var(--border)] hover:text-[var(--text-2)]",
            ].join(" ")}
          >
            <span className="text-[var(--faint)]">{index + 1}</span>
            {workspace.label}
          </Link>
        );
      })}
    </nav>
  );
}
