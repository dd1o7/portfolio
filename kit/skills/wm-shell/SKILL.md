---
name: wm-shell
description: Component architecture and conventions for this site's tiling-window-manager UI shell — panes, waybar, workspaces, split divider, command palette, and how each behaves at mobile/tablet/desktop. Use this whenever building, editing, or reviewing ANY UI component in this repo, including panes, page layout, navigation, headers, cards, lists, or anything rendered inside a pane — even when the request does not mention window managers, tiling, or the shell.
paths: ["app/**", "components/**", "*.css"]
---

# WM shell conventions

## Component inventory

Everything below lives in `components/shell/`. Do not invent parallel components; extend
these.

| Component | Role |
|---|---|
| `Waybar` | Top bar. Brand, workspace pills, active title, palette trigger, status, clock. `sticky`, height 34px desktop / 44px mobile. |
| `WorkspacePills` | The nav. Real `<Link>` elements, one per route. Active state = accent tint + accent border. |
| `Pane` | The window. Border, radius 8px, fill, optional focus glow. Owns nothing but chrome. |
| `PaneHeader` | The title bar: status dot, mono path label (`~/focus/pinn.md`), right-aligned counter. |
| `MasterStack` | Desktop tiling container. Master column + stack column + `SplitDivider`. |
| `SplitDivider` | Draggable. Writes to a CSS custom property inside `requestAnimationFrame`. Desktop only. |
| `WorkspaceSwiper` | Mobile only. Horizontal swipe between workspace routes. |
| `CommandPalette` | `SUPER K` on desktop, full-screen sheet on mobile. |
| `KeybindFooter` | Desktop only. Replaced on mobile by a one-line gesture hint. |

## The pane contract

A `Pane` never knows what is inside it, and page content never renders its own border,
background, or title bar. A page exports content; the shell wraps it.

```tsx
<Pane focus="A" label="~/projects" counter={`${shown} / ${total}`}>
  {children}
</Pane>
```

- `label` is always a filesystem-looking path in JetBrains Mono, lowercase.
- `counter` is optional, right-aligned, `--faint`.
- The status dot is `--accent`, 6px, always present.
- Panes scroll internally (`overflow: auto`), the page itself does not scroll on desktop.
  On mobile the page scrolls normally and panes size to content.

## Where state lives

- **Route** owns which workspace is active. Read it with `usePathname()`; never mirror it
  into React state.
- **Client state** owns only: which pane has focus, split ratio, stack order, palette
  open/closed, palette query.
- The shell is a client component; page content stays a server component wherever it can.
  Keep `"use client"` at the shell boundary, not on every leaf.

## Responsive rules

Below `md`, the tiling stops. What survives is the chrome:

- Render one pane per screen, full width. `MasterStack` is not mounted at all — do not
  render it and hide it with CSS, because the drag listeners still cost.
- `PaneHeader` grows to 44px and its font to 12px. It is the primary identity carrier on
  mobile; never hide it to save space.
- `WorkspacePills` scrolls horizontally with `scroll-snap`, or collapses to five dots if
  it overflows. It never wraps to a second line.
- Stack panes (`~/now`, `gh — dd1o7`, `~/contact`) render in a vertical scroll below the
  master pane, in the same order as desktop.
- `SplitDivider`, `KeybindFooter`, and all keyboard shortcuts are desktop-only. Gate on a
  media query hook, not on CSS `display: none`.
- Pane fill switches from `--surface-blur` + `backdrop-filter` to solid `--surface`.

Use one `useMediaQuery` hook reading `(min-width: 1024px)` and `(min-width: 640px)`, and
branch on it. Do not scatter breakpoints.

## Accessibility

- The waybar is `<header>`, `WorkspacePills` is `<nav aria-label="Workspaces">`, each pane
  is `<section>` with an `aria-label` matching its path label.
- The terminal typing effect is decorative. The real `<h1>` text must exist in the DOM
  unanimated, or screen readers and crawlers get nothing.
- Focus ring is `outline: 2px solid var(--accent); outline-offset: 2px` on
  `:focus-visible`. Never remove it, never leave the browser default.
- Keyboard shortcuts are an enhancement. Every action reachable by `SUPER K` must also be
  reachable by clicking something visible.

## Things that are wrong here

- A pane with a rounded radius other than 8px, or a border that is not `--border` /
  `--border-focus`.
- Centered text. Everything is flush left.
- A heading heavier than weight 500. Hierarchy comes from size and space.
- Sentence-case interface chrome. Pane labels, pills, tags, and status text are lowercase.
- Any hex literal in a component. Use the tokens.
