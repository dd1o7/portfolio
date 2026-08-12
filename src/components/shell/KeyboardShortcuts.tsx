"use client";

import { useEffect } from "react";
import { PALETTE_OPEN_EVENT } from "./CommandPalette";
import { DESKTOP, useMediaQuery } from "./useMediaQuery";
import { useWorkspaceNavigation } from "./useWorkspaceNavigation";
import { workspaces } from "./workspaces";

/**
 * Global keybinds. Renders nothing.
 *
 * Desktop only — a phone has no keyboard, and the listener is the cost we do
 * not want to pay there. Everything these reach is also reachable by tapping:
 * the pills for workspaces, the waybar button for the palette.
 */
export function KeyboardShortcuts() {
  const isDesktop = useMediaQuery(DESKTOP);
  const go = useWorkspaceNavigation();

  useEffect(() => {
    if (!isDesktop) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent(PALETTE_OPEN_EVENT));
        return;
      }

      // Bare digits only, and never while typing or while the palette is up.
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector("dialog[open]")) return;

      const index = Number(event.key);
      if (Number.isInteger(index) && index >= 1 && index <= workspaces.length) {
        event.preventDefault();
        go(workspaces[index - 1].href);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDesktop, go]);

  return null;
}
