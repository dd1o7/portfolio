"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DESKTOP, useMediaQuery } from "./useMediaQuery";
import { activeIndex, workspaces } from "./workspaces";

/** How far a drag must travel before it counts as a swipe. */
const DISTANCE = 64;
/** How much more horizontal than vertical it must be, so scrolling still wins. */
const DOMINANCE = 1.5;

/**
 * Horizontal swipe between workspaces, below `lg`.
 *
 * This is a bonus, never a requirement: every workspace is also one tap away on
 * a pill, and the content of the current one is fully visible without touching
 * anything. Someone arriving from a search result never has to discover this.
 *
 * The listeners are passive and only look at where a touch started and ended,
 * so vertical scrolling is untouched. Anything that scrolls sideways on its own
 * — the pill row, code blocks, tables, display equations — keeps its gesture.
 */
export function WorkspaceSwiper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery(DESKTOP);

  useEffect(() => {
    if (isDesktop) return;

    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (event: TouchEvent) => {
      const target = event.target as Element | null;
      if (
        event.touches.length !== 1 ||
        target?.closest("nav, pre, table, .katex-display, [data-no-swipe]")
      ) {
        tracking = false;
        return;
      }
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      tracking = true;
    };

    const onEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) < DISTANCE || Math.abs(dx) < Math.abs(dy) * DOMINANCE) return;

      const from = activeIndex(pathname);
      const to = dx < 0 ? from + 1 : from - 1;
      // No wrapping: running out of workspaces should feel like an edge.
      if (to < 0 || to >= workspaces.length) return;

      router.push(workspaces[to].href);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [isDesktop, pathname, router]);

  return (
    <main ref={ref} className={className}>
      {children}
    </main>
  );
}
