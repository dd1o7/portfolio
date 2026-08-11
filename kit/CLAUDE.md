# portfolio-dd1o7

Personal site for Dewanshu Dewangan (dd1o7). Next.js App Router, content in markdown,
deployed on Vercel at portfolio-dd1o7.vercel.app.

## What we are building

Redesigning the site as a **tiling window manager interface** — Hyprland/i3 styling:
a waybar, workspaces instead of nav items, content in bordered panes with terminal-style
title bars. Desktop tiles; mobile does not.

## Non-negotiables

These hold for every change. If a request conflicts with one, say so before writing code.

- **Workspaces are real routes, not client state.** `/`, `/projects`, `/research`, `/now`,
  `/about` stay real pages with real `<a href>`. The workspace *animation* comes from the
  View Transitions API, not from swapping component state. Breaking these URLs breaks
  RSS, OG images, and search.
- **Content stays in markdown.** Never hardcode copy, project entries, or reading-list
  items into a component. If content needs a new field, add it to the frontmatter schema.
- **Math renders at build time.** `remark-math` + `rehype-katex`. Never ship
  `katex.min.js` or `auto-render.js` to the browser.
- **Only `transform` and `opacity` are animated.** Never `width`, `height`, `top`, `left`,
  `margin`, or `filter` in a transition or keyframe.
- **No `backdrop-filter` below the `md` breakpoint.** Mobile panes use a solid tinted
  fill. This is the single biggest mobile performance risk in this design.
- **`prefers-reduced-motion` is honoured everywhere.** Every animation collapses to a
  100ms opacity fade.
- **Touch targets are ≥44px below `md`.** Pane headers, workspace pills, and tag chips
  all grow on touch; they are deliberately small only on desktop.

## Layout at each breakpoint

| Width | Layout |
|---|---|
| `< 640px` | One full-width pane per screen. Workspaces switch by horizontal swipe or by tapping a pill. Stack panes scroll vertically below the master pane. No drag-to-resize, no drag-to-reorder. |
| `640–1024px` | Two panes maximum, stacked vertically. No drag-to-resize. |
| `≥ 1024px` | Full tiling: master + stack side by side, draggable split divider, drag-to-reorder, keyboard shortcuts, keybind footer. |

## Design tokens

Defined once in `app/globals.css` as CSS custom properties. Never hardcode a hex.

```
--bg:            #101d1c   /* page ground */
--surface:       #1c2e2b   /* pane fill (solid — used alone on mobile) */
--surface-blur:  rgb(28 46 43 / 0.72)  /* pane fill on desktop, with backdrop-filter */
--inset:         rgb(16 29 28 / 0.55)  /* nested boxes: equations, cards inside panes */

--border:        #26332f   /* pane border, dividers, row rules */
--border-focus:  #327a69   /* focused pane border, hover borders */

--accent:        #4fc9ab   /* the one accent: dots, cursor, focus ring, active pill */
--accent-bright: #7cdcc3   /* field labels, active status text */
--accent-dim:    #429e88   /* keybind keys, low-emphasis accent */
--link:          #b0ecdb

--text:          #e6efec   /* headings, titles */
--text-2:        #a8bcb7   /* body prose */
--muted:         #8aa39d   /* secondary prose, summaries */
--dim:           #6d857f   /* pane header labels, kickers */
--faint:         #526661   /* counters, timestamps, footer */
```

Fonts, via `next/font` (self-hosted, subset — never a Google Fonts `<link>`):

- **Inter** — headings and body prose. Headings sit at weight 500, never bolder.
- **JetBrains Mono** — all interface chrome: pane headers, workspace pills, tags,
  timestamps, status text, keybinds. Lowercase, letter-spaced. This font is what makes
  the design read as a window manager; use it for anything that is *interface* rather
  than *reading*.

Ambient background is a single `position: fixed` layer holding both radial glows and the
44px grid. One element, painted once — never per-pane backgrounds.

## Stack

- Next.js App Router, TypeScript, Tailwind (tokens exposed as Tailwind theme values)
- Motion (`motion/react`) for the shell: pane enter/exit, layout, drag
- CSS transitions for hovers, borders, glows
- View Transitions API for route→workspace navigation

## Commands

```bash
npm run dev     # local dev
npm run build   # production build — run before claiming a change works
npm run lint
```
