"use client";

import { useEffect, useRef } from "react";
import { DESKTOP, useMediaQuery } from "./useMediaQuery";

const MIN_RATIO = 0.3;
const MAX_RATIO = 0.75;
const KEY_STEP = 0.02;

/**
 * The draggable split between the master column and the stack column.
 *
 * The element itself is always in the document — it is the 0.75rem gutter the
 * grid reserves, so its presence never shifts anything — but the pointer and
 * keyboard listeners are attached only when the desktop query matches. Below
 * `lg` there is no drag machinery at all, which is the part that actually
 * costs.
 *
 * The width lives in `--split` on `<html>`, not in React state: writing a CSS
 * custom property inside `requestAnimationFrame` keeps the drag off React's
 * render path entirely, and it survives client-side navigation between
 * workspaces because the root element is never remounted.
 */
export function SplitDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery(DESKTOP);

  useEffect(() => {
    if (!isDesktop) return;

    const handle = ref.current;
    const grid = handle?.parentElement;
    if (!handle || !grid) return;

    const root = document.documentElement;
    let frame = 0;

    const currentRatio = () => {
      const declared = getComputedStyle(root).getPropertyValue("--split").trim();
      const parsed = Number.parseFloat(declared);
      return Number.isFinite(parsed) ? parsed / 100 : 0.62;
    };

    const write = (ratio: number) => {
      const clamped = Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--split", `${(clamped * 100).toFixed(2)}%`);
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = grid.getBoundingClientRect();
      write((event.clientX - rect.left) / rect.width);
    };

    const stop = (event: PointerEvent) => {
      handle.releasePointerCapture?.(event.pointerId);
      handle.removeEventListener("pointermove", onPointerMove);
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      handle.setPointerCapture(event.pointerId);
      handle.addEventListener("pointermove", onPointerMove);
      // Held on <body> so the cursor does not flicker while the pointer is
      // over a pane, and so dragging never selects the text underneath.
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") write(currentRatio() - KEY_STEP);
      else if (event.key === "ArrowRight") write(currentRatio() + KEY_STEP);
      else if (event.key === "Home") write(MIN_RATIO);
      else if (event.key === "End") write(MAX_RATIO);
      else return;
      event.preventDefault();
    };

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
    handle.addEventListener("keydown", onKeyDown);
    handle.tabIndex = 0;
    handle.setAttribute("role", "separator");
    handle.setAttribute("aria-orientation", "vertical");
    handle.setAttribute("aria-label", "Resize the master pane");

    return () => {
      cancelAnimationFrame(frame);
      handle.removeEventListener("pointerdown", onPointerDown);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
      handle.removeEventListener("keydown", onKeyDown);
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeAttribute("tabindex");
      handle.removeAttribute("role");
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };
  }, [isDesktop]);

  return (
    <div
      ref={ref}
      className="group hidden cursor-col-resize items-center justify-center lg:flex"
    >
      <span
        aria-hidden="true"
        className="h-10 w-px rounded-full bg-[var(--border)] transition-colors group-hover:bg-[var(--border-focus)] group-focus-visible:bg-[var(--accent)]"
      />
    </div>
  );
}
