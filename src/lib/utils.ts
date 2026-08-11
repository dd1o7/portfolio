/** Small shared helpers. */

/**
 * Format a YYYY-MM-DD string for display.
 *
 * Dates are parsed as UTC on purpose — using `new Date("2026-08-11")` and then
 * reading it in a local timezone behind UTC shifts it to the 10th.
 */
export function formatDate(date: string, opts?: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...opts,
  });
}

/** Whole days between a YYYY-MM-DD string and today. */
export function daysSince(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((today - then) / 86_400_000);
}

/** "today" / "yesterday" / "5 days ago" / "3 weeks ago" */
export function relativeDate(date: string): string {
  const days = daysSince(date);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "last week";
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/** Join class names, dropping falsy values. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
