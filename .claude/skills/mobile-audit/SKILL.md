---
name: mobile-audit
description: Run the mobile responsive and performance audit against the built site on an emulated Android device, then fix what fails.
argument-hint: [route]
disable-model-invocation: true
allowed-tools: Bash(pnpm build), Bash(pnpm start *), Bash(pnpm exec next *)
---

Audit `$ARGUMENTS` (default: all of `/`, `/projects`, `/research`, `/now`, `/about`).

Requires the Chrome DevTools MCP server. If its tools are not available, stop and say so
rather than guessing at the results.

## Setup

1. `pnpm build`, then serve the production build. Never audit the dev server — dev
   builds are unoptimised and the numbers are meaningless.
2. Emulate a mid-range Android: **412×915 viewport, 4× CPU throttle, Slow 4G**. This is
   the target device, not a flagship.

## Per route

For each route, record a performance trace across: initial load, one workspace swipe, and
one scroll to the bottom of the master pane. Then check every item below.

### Layout

- No horizontal overflow at 412px, and again at 320px.
- Every interactive element measures ≥44×44px: pane headers, workspace pills, tag chips,
  palette trigger, contact rows.
- Workspace pills do not wrap to a second line.
- No pane renders side-by-side with another below 640px.
- Text is readable without zoom: body ≥14px, mono chrome ≥11px.

### What must not be in the DOM

- `backdrop-filter` on any element below the `md` breakpoint.
- A mounted `MasterStack`, `SplitDivider`, or `KeybindFooter`.
- Any client-side KaTeX script request.
- More than one full-viewport background layer.

### Budgets

| Metric | Budget |
|---|---|
| LCP | < 2.0s |
| CLS | < 0.05 |
| INP | < 200ms |
| Long tasks during swipe | 0 above 50ms |
| Total JS transferred | < 180KB gzipped |
| Font requests | self-hosted only, no third-party origin |

### Motion

- Trigger `prefers-reduced-motion` and confirm every animation collapses to a fade.
- During the swipe trace, confirm no layout or style recalculation appears in the frames.
  If it does, something is animating a property other than `transform` or `opacity` —
  find it and name the exact CSS rule.

## Output

Report a table of route × check × pass/fail with the measured number, not a verbal
impression. Then fix the failures in order of severity, and re-run the audit on the routes
you changed. Do not report a fix as done without the second measurement.
