import { Waybar } from "@/components/shell/Waybar";
import { AmbientBackground } from "@/components/shell/AmbientBackground";
import { WorkspaceSwiper } from "@/components/shell/WorkspaceSwiper";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Chrome for the public site. The admin does not use this.
 *
 * The wrapper is what makes desktop feel like a window manager: at `lg` it is
 * exactly one viewport tall and never scrolls, so the panes inside scroll
 * instead. Below `lg` it grows with its content and the page scrolls normally.
 * The height is set here rather than on `<body>` because the admin shares that
 * element and needs ordinary scrolling.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AmbientBackground />
      {/* `wm-shell` is what the rule in globals.css keys off to stop <html> and
          <body> scrolling at lg. Do not rename it without updating that rule. */}
      <div className="wm-shell flex min-h-full flex-1 flex-col lg:h-full lg:min-h-0 lg:overflow-hidden">
        <Waybar />
        <WorkspaceSwiper className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          {children}
        </WorkspaceSwiper>
        <SiteFooter />
      </div>
    </>
  );
}
