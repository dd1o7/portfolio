"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { DESKTOP, useMediaQuery } from "./useMediaQuery";
import { activeIndex, workspaces } from "./workspaces";
import { useWorkspaceNavigation } from "./useWorkspaceNavigation";

/** How far a drag must travel before it counts as a swipe. */
const DISTANCE = 56;
/** How much more horizontal than vertical it must be, so scrolling still wins. */
const DOMINANCE = 1.5;
/** One gesture can arrive twice; ignore a second navigation this close behind. */
const DEBOUNCE = 400;

/** Anything that scrolls sideways on its own keeps its own gesture. */
const EXCLUDED = "nav, pre, table, .katex-display, [data-no-swipe]";

/**
 * Horizontal swipe between workspaces, below `lg`.
 *
 * This is a bonus, never a requirement: every workspace is also one tap away on
 * a labelled pill, and the content of the current one is fully visible without
 * touching anything. Someone arriving from a search result never has to
 * discover this.
 *
 * Touch and pointer events are both handled, because which of the two a browser
 * emits for a finger varies — real touchscreens, pens, and DevTools' device
 * emulation do not agree. They track independently so that one aborting (a
 * `pointercancel` when the browser decides the gesture was a scroll) cannot
 * suppress the other, and a shared cooldown stops one swipe navigating twice.
 */
export function WorkspaceSwiper({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isDesktop = useMediaQuery(DESKTOP);
  const go = useWorkspaceNavigation();

  useEffect(() => {
    if (isDesktop) return;

    const el = ref.current;
    if (!el) return;

    let lastNavigation = 0;

    const navigate = (dx: number, dy: number) => {
      if (Math.abs(dx) < DISTANCE || Math.abs(dx) < Math.abs(dy) * DOMINANCE) return;

      const now = Date.now();
      if (now - lastNavigation < DEBOUNCE) return;

      const from = activeIndex(pathname);
      const to = dx < 0 ? from + 1 : from - 1;
      // No wrapping: running out of workspaces should feel like an edge.
      if (to < 0 || to >= workspaces.length) return;

      lastNavigation = now;
      // Same path as a pill click, so a swipe and a tap slide identically.
      go(workspaces[to].href);
    };

    /** One in-flight gesture. Touch and pointer each get their own. */
    const gesture = () => {
      let x = 0;
      let y = 0;
      let live = false;
      return {
        begin(target: EventTarget | null, cx: number, cy: number) {
          if ((target as Element | null)?.closest(EXCLUDED)) {
            live = false;
            return;
          }
          x = cx;
          y = cy;
          live = true;
        },
        abort() {
          live = false;
        },
        finish(cx: number, cy: number) {
          if (!live) return;
          live = false;
          navigate(cx - x, cy - y);
        },
      };
    };

    const touch = gesture();
    const pointer = gesture();

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return touch.abort();
      touch.begin(event.target, event.touches[0].clientX, event.touches[0].clientY);
    };
    const onTouchEnd = (event: TouchEvent) => {
      const point = event.changedTouches[0];
      if (point) touch.finish(point.clientX, point.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      // A mouse drag is text selection, not a swipe.
      if (event.pointerType === "mouse") return;
      pointer.begin(event.target, event.clientX, event.clientY);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      pointer.finish(event.clientX, event.clientY);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("pointercancel", pointer.abort, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", pointer.abort);
    };
  }, [isDesktop, pathname, go]);

  return (
    <main ref={ref} className={className}>
      {children}
    </main>
  );
}
