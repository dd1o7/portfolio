"use client";

import { Pane } from "./Pane";
import { DESKTOP, useMediaQuery } from "./useMediaQuery";
import { formatDate } from "@/lib/utils";

/**
 * The résumé, as a stack pane on `/about`.
 *
 * Desktop gets an inline preview; below `lg` it is a link and nothing else.
 * That split is not cosmetic — browsers render embedded PDFs inconsistently on
 * phones and often just show a grey box, and the file is a large download to
 * spend on someone who may only want the link.
 *
 * The embed is gated on the media query rather than hidden with CSS on purpose:
 * a `display: none` iframe still fetches its document, so hiding it would cost
 * mobile the whole PDF for nothing.
 */
export function ResumePane({
  path,
  sizeKb,
  updated,
  label,
}: {
  path: string;
  sizeKb: number;
  updated: string;
  label: string;
}) {
  const isDesktop = useMediaQuery(DESKTOP);

  return (
    <Pane label="~/cv" counter={`${sizeKb} kb`}>
      <div className="mono flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          href={path}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-target rounded-[var(--radius-sm)] border border-[var(--border-focus)] bg-[var(--accent-wash)] px-3 text-[var(--accent-bright)] transition-colors hover:border-[var(--accent)]"
        >
          {label.toLowerCase()} (pdf) ↗
        </a>
        <span className="text-[var(--faint)]">updated {formatDate(updated)}</span>
      </div>

      {isDesktop && (
        <object
          data={`${path}#view=FitH&toolbar=0`}
          type="application/pdf"
          aria-label={`${label} preview`}
          className="mt-4 h-[26rem] w-full rounded-[var(--radius)] border border-[var(--border)]"
        >
          {/* Shown only if the browser will not render a PDF inline. */}
          <p className="mono p-4 text-[var(--muted)]">
            your browser will not preview PDFs — use the link above.
          </p>
        </object>
      )}
    </Pane>
  );
}
