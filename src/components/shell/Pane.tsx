import { PaneHeader } from "./PaneHeader";

type PaneProps = {
  /** Filesystem-looking path shown in the title bar, e.g. `~/projects`. */
  label: string;
  /** Optional right-aligned count, e.g. `3 / 12`. */
  counter?: string;
  /** Marks this pane as the focused window. Only one pane is focused at a time. */
  focused?: boolean;
  children: React.ReactNode;
};

/**
 * A window.
 *
 * A Pane never knows what is inside it, and page content never renders its own
 * border, background or title bar. A page exports content; the shell wraps it.
 */
export function Pane({ label, counter, focused = false, children }: PaneProps) {
  return (
    <section
      aria-label={label}
      className={[
        // `pane` carries the open animation and the focus-glow transition; see
        // the MOTION section of globals.css.
        "pane flex flex-col overflow-hidden rounded-[var(--radius-pane)] border",
        // Solid fill below md. The blurred fill is the single biggest mobile
        // performance risk in this design, so it starts at the md breakpoint.
        "bg-[var(--surface)] md:bg-[var(--surface-blur)] md:backdrop-blur-md",
        focused
          ? "border-[var(--border-focus)] shadow-[0_0_18px_-6px_rgb(79_201_171/0.5)]"
          : "border-[var(--border)]",
      ].join(" ")}
    >
      <PaneHeader label={label} counter={counter} />
      {/* On desktop a pane scrolls inside itself and the page does not scroll at
          all. On mobile the page scrolls normally and panes size to content. */}
      <div className="min-h-0 flex-1 px-5 py-5 sm:px-7 sm:py-6 lg:overflow-y-auto">{children}</div>
    </section>
  );
}
