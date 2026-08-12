"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, workspaces } from "./workspaces";

/**
 * The nav.
 *
 * These are real links, not client state — the route owns which workspace is
 * active, and `usePathname()` only reads it. Never mirror it into React state.
 *
 * Below `sm` the labels do not fit, so inactive workspaces show only their
 * number and the active one keeps its name. That is how a real waybar behaves,
 * and it means the row never scrolls or wraps on a phone. The full name is
 * always in the accessible name of the link.
 */
export function WorkspacePills() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Workspaces"
      /* Scrolls sideways rather than wrapping. A second row would push the
         waybar off its fixed height. */
      className="flex min-w-0 snap-x snap-proximity flex-nowrap items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {workspaces.map((workspace, index) => {
        const active = isActive(pathname, workspace.href);

        return (
          <Link
            key={workspace.href}
            href={workspace.href}
            aria-label={`${index + 1} ${workspace.label}`}
            aria-current={active ? "page" : undefined}
            className={[
              "mono flex shrink-0 snap-start items-center gap-1.5 rounded-[var(--radius-sm)] border px-2.5",
              // A 44px target below md; deliberately small only on desktop.
              "h-11 min-w-11 justify-center leading-none transition-colors",
              "sm:min-w-0 sm:justify-start md:h-[22px]",
              active
                ? "border-[var(--border-focus)] bg-[var(--accent-wash)] text-[var(--accent-bright)]"
                : "border-transparent text-[var(--dim)] hover:border-[var(--border)] hover:text-[var(--text-2)]",
            ].join(" ")}
          >
            <span className="text-[var(--faint)]">{index + 1}</span>
            <span className={active ? undefined : "max-sm:hidden"}>{workspace.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
