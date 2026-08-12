import { SplitDivider } from "./SplitDivider";

/** Makes the pane inside fill its column and scroll internally on desktop. */
const COLUMN = "flex min-h-0 flex-col lg:h-full lg:[&>section]:h-full lg:[&>section]:min-h-0";

/**
 * The tiling container: a master pane, and optionally a column of stack panes.
 *
 * The arrangement is pure CSS, so it is right on the first paint and costs
 * nothing on mobile — one column below `lg`, master beside stack above it.
 * Only the divider's drag listeners are gated behind a media query, because
 * only they cost anything to mount.
 *
 * Every route goes through this even with no stack panes, because this is also
 * what makes the master pane fill the viewport and scroll inside itself on
 * desktop. A route that skipped it would have its content clipped, since the
 * page itself does not scroll at `lg`.
 */
export function MasterStack({
  master,
  stack = [],
}: {
  master: React.ReactNode;
  /** Keyed panes, in the order they tile down the stack column. */
  stack?: React.ReactNode[];
}) {
  if (stack.length === 0) {
    return <div className={`${COLUMN} flex-1`}>{master}</div>;
  }

  return (
    /* `grid-rows-[minmax(0,1fr)]` is what gives the single row the container's
       full height, so the columns inside it can scroll rather than grow. */
    <div className="flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-cols-[var(--split)_0.75rem_1fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-0">
      <div className={COLUMN}>{master}</div>

      <SplitDivider />

      {/* Stack panes size to their content; the column scrolls. */}
      <div className="flex min-h-0 flex-col gap-3 lg:h-full lg:overflow-y-auto">{stack}</div>
    </div>
  );
}
