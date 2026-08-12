"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * The two breakpoints the shell branches on. Everything responsive reads one of
 * these — do not scatter widths through the components.
 *
 * These are the redesign's breakpoints, not Tailwind's: `lg` (1024px) is where
 * tiling begins, `sm` (640px) is where one-pane-per-screen ends.
 */
export const DESKTOP = "(min-width: 1024px)";
export const TABLET = "(min-width: 640px)";

/**
 * True when the query matches.
 *
 * Used to decide whether to *attach behaviour* — drag listeners, swipe
 * listeners, keyboard shortcuts — not to decide what the layout looks like.
 * Layout is CSS, so it is correct on the very first paint; behaviour arrives a
 * frame after hydration, which nobody can see.
 *
 * The server snapshot is `false`, so a server render always produces the
 * no-behaviour version and the desktop upgrade happens on the client.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
