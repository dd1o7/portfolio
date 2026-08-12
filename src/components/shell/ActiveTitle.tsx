"use client";

import { usePathname } from "next/navigation";
import { activeIndex, workspaces } from "./workspaces";

/**
 * The focused workspace, named in the waybar — the window-manager habit of
 * always telling you where you are.
 *
 * Hidden below `md`, where the pane header already carries that job and the bar
 * has no room to spare.
 */
export function ActiveTitle() {
  const pathname = usePathname();
  const workspace = workspaces[activeIndex(pathname)];
  const label = workspace.label === "home" ? "~/" : `~/${workspace.label}`;

  return (
    <span className="mono hidden min-w-0 truncate text-[var(--faint)] md:inline">{label}</span>
  );
}
