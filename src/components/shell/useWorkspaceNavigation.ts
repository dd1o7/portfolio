"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { activeIndex, workspaces } from "./workspaces";

/** Longest we will hold the old frame waiting for the new route to commit. */
const COMMIT_TIMEOUT = 400;

/**
 * Navigate between workspaces with a direction-aware slide.
 *
 * The workspaces stay real routes — this only wraps `router.push` in a view
 * transition, so `/projects` is still a page with a real URL. Direction comes
 * from comparing indices in `workspaces`, never from a per-link constant.
 *
 * The browser's View Transitions API is driven directly rather than through the
 * framework: React 19.2 stable does not export `ViewTransition`, and Next 16.3
 * never calls `startViewTransition` itself, so the alternative would be moving
 * a live site onto canary builds. `startViewTransition` holds the old frame
 * until the callback's promise settles, and the App Router gives us no await —
 * so the promise is resolved by the effect below, when the new pathname
 * actually commits, with a timeout so a slow route can never freeze the screen.
 */
export function useWorkspaceNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const commit = useRef<(() => void) | null>(null);

  useEffect(() => {
    commit.current?.();
    commit.current = null;
  }, [pathname]);

  return useCallback(
    (href: string) => {
      const to = workspaces.findIndex((workspace) => workspace.href === href);
      const from = activeIndex(pathname);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (to === -1 || to === from || reduced || !document.startViewTransition) {
        router.push(href);
        return;
      }

      const root = document.documentElement;
      root.dataset.ws = to > from ? "forward" : "back";

      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            const done = () => {
              clearTimeout(timer);
              resolve();
            };
            const timer = setTimeout(done, COMMIT_TIMEOUT);
            commit.current = done;
            router.push(href);
          }),
      );

      transition.finished.finally(() => {
        delete root.dataset.ws;
      });
    },
    [pathname, router],
  );
}
