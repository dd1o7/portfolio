/**
 * A pane's title bar.
 *
 * On mobile this is the primary identity carrier — it is what tells you which
 * workspace you are looking at — so it grows rather than shrinking, and is
 * never hidden to save space.
 */
export function PaneHeader({ label, counter }: { label: string; counter?: string }) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-2.5 border-b border-[var(--border)] px-4 md:h-8 md:px-3.5">
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]"
      />
      <span className="mono truncate text-[var(--dim)] max-md:text-[0.75rem]">{label}</span>
      {counter && (
        <span className="mono ml-auto shrink-0 text-[var(--faint)] max-md:text-[0.75rem]">
          {counter}
        </span>
      )}
    </div>
  );
}
