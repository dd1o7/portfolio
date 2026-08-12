"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, workspaces } from "./workspaces";
import { useWorkspaceNavigation } from "./useWorkspaceNavigation";

/**
 * The nav.
 *
 * These are real links, not client state — the route owns which workspace is
 * active, and `usePathname()` only reads it. Never mirror it into React state.
 *
 * The names are always visible. Below `sm` the *numbers* are what give way
 * instead — they exist to pair with the keyboard shortcuts, which a phone does
 * not have, so they cost a visitor nothing there and buy the room the labels
 * need. Nobody should have to guess what workspace 3 contains.
 */
export function WorkspacePills() {
  const pathname = usePathname();
  const go = useWorkspaceNavigation();

  /**
   * Take over only the plain left click. Modified clicks and middle clicks stay
   * the browser's, so "open in new tab" keeps working — these are real links.
   */
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    go(href);
  }

  return (
    <nav
      aria-label="Workspaces"
      /* Scrolls sideways rather than wrapping. A second row would push the
         waybar off its fixed height. */
      className="flex min-w-0 snap-x snap-proximity flex-nowrap items-center gap-0.5 overflow-x-auto sm:gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {workspaces.map((workspace, index) => {
        const active = isActive(pathname, workspace.href);

        return (
          <Link
            key={workspace.href}
            href={workspace.href}
            onClick={(event) => handleClick(event, workspace.href)}
            aria-label={`${index + 1} ${workspace.label}`}
            aria-current={active ? "page" : undefined}
            className={[
              "mono workspace-pill flex shrink-0 snap-start items-center justify-center gap-1.5",
              "rounded-[var(--radius-sm)] border",
              // A 44px target below md; deliberately small only on desktop.
              "h-11 min-w-11 leading-none transition-colors",
              // Tight enough that all five labels fit a 320px screen without
              // the row scrolling — measured, see the Phase 5 audit.
              "px-1 sm:px-2.5 md:h-[22px]",
              active
                ? "border-[var(--border-focus)] bg-[var(--accent-wash)] text-[var(--accent-bright)]"
                : "border-transparent text-[var(--dim)] hover:border-[var(--border)] hover:text-[var(--text-2)]",
            ].join(" ")}
          >
            <span className="hidden text-[var(--faint)] sm:inline">{index + 1}</span>
            <span>{workspace.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
