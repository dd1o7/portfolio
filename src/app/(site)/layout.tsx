import { Waybar } from "@/components/shell/Waybar";
import { AmbientBackground } from "@/components/shell/AmbientBackground";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Chrome for the public site. The admin does not use this.
 *
 * Phase 1 lays out panes in a plain vertical flow. The tiling containers
 * (MasterStack, the split divider, the mobile swiper) arrive in Phase 3.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AmbientBackground />
      <Waybar />
      <main className="flex-1 px-3 py-3">{children}</main>
      <SiteFooter />
    </>
  );
}
