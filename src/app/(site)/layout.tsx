import { Waybar } from "@/components/shell/Waybar";
import { AmbientBackground } from "@/components/shell/AmbientBackground";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Chrome for the public site. The admin does not use this.
 *
 * Phase 2 stacks a route's panes vertically in DOM order. That order is the one
 * Phase 3 tiles into master + stack on desktop, so the first pane a page renders
 * is its master and the rest are its stack.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AmbientBackground />
      <Waybar />
      <main className="flex flex-1 flex-col gap-3 p-3">{children}</main>
      <SiteFooter />
    </>
  );
}
