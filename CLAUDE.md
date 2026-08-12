# CLAUDE.md

Context for Claude Code sessions in this repository.

## What this is

A personal portfolio for **Dewanshu Dewangan** — a student working toward
research in physics-informed machine learning, with quantitative finance as
independent reading. Next.js 16 App Router, TypeScript, Tailwind v4, deployed on
Vercel's free Hobby tier at <https://portfolio-dd1o7.vercel.app>.

**The owner has little web development experience.** Prefer clear code over
clever code, explain changes in plain terms, and do not introduce a dependency
where a few lines would do. Keep anything they need to do themselves in a
separate, clearly marked section rather than mixed into explanation.

**Never invent content.** An earlier version of this site shipped placeholder
projects and a research note that described work that did not exist. They were
removed. This is a portfolio real people will read: if there is no material for a
page, leave it empty and say so. Ask rather than fill.

**The site is mid-redesign.** See "The redesign" below for the target design and
which phases have landed. Anything not yet marked complete describes intent, not
what is on disk.

## Core idea

Content is Markdown in `content/`. There is no database — GitHub is the store,
and a commit to `main` triggers a Vercel redeploy. The `/admin` dashboard writes
those same files via the GitHub Contents API, so both editing paths are
interchangeable.

## Commands

```bash
pnpm dev      # local dev server on :3000
pnpm build    # production build — must pass before pushing
pnpm lint     # eslint
```

This project uses **pnpm**, not npm. `pnpm-lock.yaml` is committed.

## Layout

```
content/            all site content (Markdown + YAML frontmatter)
  projects/*.md
  research/*.md
  now/*.md          one file per weekly update, named YYYY-MM-DD.md
  site/home.md      the homepage introduction
  site/about.md
src/
  site.config.ts    all personal data — name, handle, links, nav
  app/globals.css   every design token; the whole theme lives here
  lib/content.ts    read + validate + render Markdown (used by every page)
  lib/utils.ts      date formatting, cx
  lib/resume.ts     build-time check for public/resume.pdf
  components/
    EntryList.tsx   the one list layout — homepage, listings, tag pages
    shell/          the window-manager chrome (see below)
```

Note the `src/` prefix. Paths in any imported design kit that say `app/**` or
`components/**` mean `src/app/**` and `src/components/**` here.

## Frontmatter

Validated with Zod in `src/lib/content.ts`. Invalid frontmatter fails the build
with a message naming the file and field — this is deliberate, do not soften it
into a silent fallback.

**projects/**
```yaml
title: string          # required
summary: string        # required — the one line shown in listings
date: 2026-08-11       # required, YYYY-MM-DD (quoted or not, both work)
tags: [PINNs, finance] # optional
status: active         # active | shipped | archived
featured: true         # optional — surfaces on the homepage
draft: false           # true = visible locally, hidden on the live site
stack: [PyTorch]       # optional
links: { repo:, demo:, paper: }
```

**research/** — same base fields, with `links: { arxiv:, pdf:, doi:, code: }`
and no `status` or `stack`.

**now/** — just `date:`, plus optional `title:`.

Content stays in Markdown. Never hardcode copy, project entries or reading-list
items into a component. If content needs a new field, add it to the frontmatter
schema first.

## Conventions that matter

- **Design tokens only.** Colours and spacing come from CSS custom properties in
  `globals.css` (`var(--accent)`, `var(--muted)`, …). Never hard-code a hex
  value in a component — the theme is meant to be swappable from that one file.
- **`globals.css` is unlayered, so it beats every Tailwind utility.** Tailwind
  ships its utilities in `@layer utilities`, and an unlayered rule wins over any
  layered one regardless of specificity. So a `text-[…]` class *cannot* override
  the `font-size` that `.mono` sets — it loses silently, with no warning. When a
  hand-written class and a utility fight, change the hand-written class or add a
  scoped rule beside it (see `.workspace-pill`).
- **Reuse `EntryList`.** The homepage, both listing pages and tag pages all
  render through it. Do not write another list layout.
- **`lib/content.ts` is the only place that touches the filesystem for content.**
- **Maths and code render at build time.** KaTeX (`$…$` inline, `$$…$$` display)
  via `remark-math` + `rehype-katex`, and Shiki highlighting, are already wired
  into the Markdown pipeline. Never ship `katex.min.js` or `auto-render.js` to
  the browser.

## Admin (`/admin`)

Password-protected dashboard that writes content by committing to GitHub.

```
src/middleware.ts              guards /admin/* and /api/admin/*
src/lib/auth.ts                session cookie — EDGE-SAFE, jose only
src/lib/password.ts            scrypt + rate limit — NODE ONLY
src/lib/github.ts              Contents API read/write
src/lib/collections.ts         form field definitions + frontmatter builder
src/app/admin/                 login, dashboard, editor
src/app/api/admin/             login, logout, save, delete, upload, preview
src/components/admin/          EntryForm, MarkdownEditor, LoginForm, …
```

**The auth split is not stylistic — do not merge these files.** Middleware runs
in the Edge runtime, and the bundler traces every import. A single reference to
`node:crypto` in `auth.ts`'s import graph fails the build, *even behind a dynamic
import*. Password work therefore lives in `password.ts`, imported only by route
handlers that declare `export const runtime = "nodejs"`.

**Admin reads through the GitHub API, not the filesystem.** On Vercel the
filesystem is a build snapshot, so a just-saved file would not appear until the
redeploy finished. The dashboard cross-references the API listing against the
built content to show which entries are still deploying.

**Adding a form field** is one line in `collections.ts` — but the matching Zod
schema in `content.ts` must be updated too, or the build will reject the file.

**Admin is out of scope for the redesign.** It keeps its current layout. It does
still consume tokens from `globals.css`, so when the palette changes it needs a
compatibility pass — any token that is renamed or removed must be updated in
`src/components/admin/` and `src/app/admin/` too, or those pages break silently.

---

# The redesign

The site is being rebuilt as a **tiling window manager interface** — Hyprland/i3
styling: a waybar, workspaces instead of nav items, content in bordered panes
with terminal-style title bars. Desktop tiles; mobile does not.

The source material is in `kit/` (design brief, phase prompts, and the
`wm-shell` / `hypr-motion` / `mobile-audit` skills, installed to
`.claude/skills/`).

## Decisions already made

These were settled before Phase 1 and are not open questions:

- **Dark only.** The light theme, `ThemeToggle`, the no-flash inline script and
  the three-state theming pattern are all removed. One palette, defined once on
  bare `:root`. Set `color-scheme: dark` and a dark `<meta name="theme-color">`
  so browser UI and form controls match.
- **`/admin` keeps its current design** (see above).
- **Article pages are master + metadata stack.** `/projects/[slug]` and
  `/research/[slug]` render the body in the master pane and a stack pane
  alongside for date, status, tags and links. On mobile the metadata pane
  follows the body.
- **Mobile listings are visible with zero interaction.** Someone landing on
  `/projects` from a search result sees the list immediately. Swipe is a
  discoverable bonus, never a requirement for reaching content.

## Non-negotiables

These hold for every change. If a request conflicts with one, say so before
writing code.

- **Workspaces are real routes, not client state.** `/`, `/projects`,
  `/research`, `/now`, `/about` stay real pages with real `<a href>`. The
  workspace *animation* comes from the View Transitions API, not from swapping
  component state. Breaking these URLs breaks RSS, OG images and search.
- **Only `transform` and `opacity` are animated.** Never `width`, `height`,
  `top`, `left`, `margin` or `filter` in a transition or keyframe.
- **No `backdrop-filter` below the `md` breakpoint.** Mobile panes use a solid
  tinted fill. This is the single biggest mobile performance risk in this design.
- **`prefers-reduced-motion` is honoured everywhere.** Every animation collapses
  to a 100ms opacity fade.
- **Touch targets are ≥44px below `md`.** Pane headers, workspace pills and tag
  chips all grow on touch; they are deliberately small only on desktop. Small
  text links get the `.tap-target` class, which pads them to 44px below `md` and
  releases above it. Inline links *inside prose* are the one exemption — a 44px
  line box would wreck the paragraph, and WCAG 2.5.8 exempts them.

## The shell (`src/components/shell/`)

`Pane` never knows what is inside it, and page content never renders its own
border, background or title bar. A page returns a fragment of `Pane`s; the layout
stacks them. **The first pane a route renders is its master, the rest are its
stack** — Phase 3 tiles them in exactly that DOM order, so do not reorder panes
for visual reasons.

| Component | Role |
|---|---|
| `MasterStack` | The tiling container. **Every route goes through it**, stack or not — it is also what makes the master pane fill the viewport and scroll internally. |
| `Waybar` | Top bar. Server component, so `hasResume()` keeps its build-time check. |
| `WorkspacePills` | The nav. Labels are always visible; below `sm` the *numbers* give way to make room for them. |
| `workspaces.ts` | Plain data: the workspace order, `isActive`, `activeIndex`. The single source of truth for "which way is forward". |
| `Pane` / `PaneHeader` | The window and its title bar. `label`, `counter`, `focused`. |
| `FilterPane` | Listing pane. Client-only so the header counter tracks the tag filter. |
| `MetaPane` | The stack pane beside an article: frontmatter that is not the body. |
| `SplitDivider` | Drags the master/stack split. Writes `--split` on `<html>` inside `requestAnimationFrame`. |
| `WorkspaceSwiper` | Renders `<main>`; adds swipe-between-workspaces below `lg`. |
| `CommandPalette` | A `<dialog>`, so the focus trap, top layer and Escape come from the platform. Full-screen sheet below `md`. |
| `PaletteTrigger` | The visible way in. Waybar at `md`+, footer below — a 44px button and five pill labels do not both fit 320px. |
| `KeyboardShortcuts` | Renders nothing. `1`–`5` and `⌘K`, desktop only. |
| `KeybindFooter` | Keybinds at `lg`, a gesture hint below. Replaced `SiteFooter`. |
| `ActiveTitle` | The focused workspace, named in the waybar. `md`+ only. |
| `ResumePane` | `~/cv` on /about. Inline PDF preview at `lg`, a link below it. |
| `useMediaQuery` | The one responsive hook. `DESKTOP` (1024px) and `TABLET` (640px). |
| `Clock`, `AmbientBackground` | Waybar clock; the one fixed glow-and-grid layer. |

**Everything the palette reaches is also reachable by clicking something
visible** — the pills, the listings, the `~/contact` pane. Keyboard shortcuts
are an enhancement and are desktop-only; the palette itself is not, which is why
its trigger exists at every width. `src/lib/palette.ts` builds the item list on
the server from the same content the pages render, so a new project or tag
appears in it with nothing else to update.

`KeybindFooter` carries no links, so the two things `SiteFooter` used to hold
moved: contact links live in the `~/contact` pane on `/about`, and the feed
lives in the waybar at `md`+ and in the palette everywhere.

**Layout is CSS; only behaviour is gated by `useMediaQuery`.** The arrangement
has to be right on the first paint, and a hook cannot know the viewport during a
server render. So the columns, the stacking and the divider's slot are all CSS,
and the hook decides only whether to *attach* drag and swipe listeners — which
is the part that actually costs anything on a phone.

Pane labels are lowercase, filesystem-looking, JetBrains Mono. Routes map to
`~/home`, `~/projects`, `~/research`, `~/now`, `~/about`, `~/tags/<tag>`,
`~/projects/<slug>.md`, plus the stack panes `metadata`, `gh — <handle>` and
`~/contact`.

A pane with nothing in it is never rendered — `GitHubActivity` owns its own
`Pane` for exactly this reason, so that an unavailable GitHub API produces no
window rather than an empty one.

## Motion

The whole vocabulary lives in the MOTION section of `globals.css` — four
Hyprland beziers (`--ease-overshot`, `--ease-smooth`, `--ease-wind`,
`--ease-exit`), the keyframes, and the view-transition rules. A new motion goes
there first; never invent a one-off curve in a component. See the `hypr-motion`
skill for the full table.

Hover and focus timing is set once through Tailwind's
`--default-transition-duration` / `--default-transition-timing-function`, so
every `transition-*` utility already moves on `--ease-smooth` at 140ms.

**The workspace slide drives the View Transitions API by hand.** React 19.2
stable does not export `ViewTransition` and Next 16.3 never calls
`startViewTransition`, so the framework offers nothing here and the alternative
was putting a live site on canary builds. `useWorkspaceNavigation` sets
`data-ws="forward" | "back"` on `<html>` from the index comparison, starts the
transition, and resolves it from an effect watching `usePathname()` — with a
400ms timeout, so a slow route can never leave the screen frozen on a stale
frame. Under `prefers-reduced-motion` it skips the transition entirely and just
pushes.

**The view-transition group animations are pinned off.** The browser's default
group animation morphs the old box into the new one by interpolating `width`,
`height` *and* `backdrop-filter` — layout work every frame, and a
backdrop-filter on mobile, both of which this design forbids. `globals.css` sets
`animation: none` on `::view-transition-group(root)` and `(workspace)` so the
slide is carried entirely by `transform` on old/new. Confirm with
`document.getAnimations()` during a swipe: nothing but `transform` and `opacity`
should appear.

**The block cursor after the homepage heading** (`.prompt-cursor`) is the one
place the window-manager metaphor speaks inside the content. It is decorative —
`aria-hidden`, contributes nothing to the accessible name, safe to delete. Note
that the blanket `animation-duration: 100ms` in the reduced-motion block would
turn its calm 1.2s blink into a single hard flash, so that block disables it
explicitly and leaves it solid. Any future looping animation needs the same
treatment.

The typing effect the original brief describes is **deliberately not built**: it
delays the most important text on the page behind an animation, can look broken
on a slow device, and has to be safe to remove for reduced-motion users anyway.
The cursor gives the same signal at no cost.

Two items from the motion table are deliberately not built:

- **Finger-following swipe.** The mobile slide fires on release, not during the
  drag. Tracking the finger means both workspaces rendered at once, which is the
  component-state swapping the non-negotiables forbid.
- **Stack reorder.** Drag-to-reorder was never built, so its `layout` animation
  has nothing to animate. It would need a drag library or ~150 lines of custom
  drag for two or three panes.

## Layout at each breakpoint

| Width | Layout |
|---|---|
| `< 640px` | One full-width pane per screen. Workspaces switch by horizontal swipe or by tapping a pill. Stack panes scroll vertically below the master pane. No drag-to-resize, no drag-to-reorder. |
| `640–1024px` | Two panes maximum, stacked vertically. No drag-to-resize. |
| `≥ 1024px` | Full tiling: master + stack side by side, draggable split divider, drag-to-reorder, keyboard shortcuts, keybind footer. |

At `lg` the site is exactly one viewport tall and does not scroll — panes scroll
inside themselves instead. `<html>` and `<body>` are what own the page
scrollbar, so the height has to go there; a height on an inner wrapper does not
stop them growing. The rule in `globals.css` is scoped with `:has(> .wm-shell)`
so `/admin`, which shares `<body>`, keeps ordinary scrolling. **Renaming the
`wm-shell` class on the wrapper in `(site)/layout.tsx` breaks this silently.**

Two deviations from the original brief, both forced by rules that outrank it:

- The waybar is **48px** below `md`, not 44px — a 44px workspace pill has to fit
  inside it, and the touch-target rule wins.
- Workspace pills **keep their labels** at every width and drop their numbers
  below `sm` instead. Numbered-only pills fit the brief's "never wraps, never
  scrolls" rule but are useless to a visitor who does not already know what
  workspace 3 holds. The numbers pair with keyboard shortcuts, which a phone
  does not have.

## Design tokens

Defined once in `src/app/globals.css` as CSS custom properties. Never hardcode a
hex.

```
--bg:            #0d0f11   /* page ground — near-neutral, 7/255 channel spread */
--surface:       #15181c   /* pane fill (solid — used alone on mobile) */
--surface-blur:  rgb(21 24 28 / 0.72)  /* pane fill on desktop, with backdrop-filter */
--inset:         rgb(0 0 0 / 0.28)     /* nested boxes: equations, cards inside panes */

--border:        #30383f   /* pane border, dividers, row rules */
--border-focus:  #3b776b   /* focused pane border — 3.42:1, meets the 3:1 UI floor */

--accent:        #4db6a0   /* focus ring, active pill, focused pane dot */
--accent-bright: #7ad0bd   /* field labels in the metadata pane */
--accent-dim:    #3d9384   /* keybind keys, low-emphasis accent */
--link:          #8fd3c2

--split:         62%       /* master column width at lg; SplitDivider rewrites it */

--text:          #e6efec   /* headings, titles */
--text-2:        #a8bcb7   /* body prose */
--muted:         #8aa39d   /* secondary prose, summaries */
--dim:           #6d857f   /* pane header labels, kickers */
--faint:         #526661   /* counters, timestamps, footer */
```

Fonts, via `next/font` (self-hosted and subset — never a Google Fonts `<link>`):

- **Source Serif 4** — headings and body prose. Headings sit at weight 500,
  never bolder.
- **JetBrains Mono** — all interface chrome: pane headers, workspace pills, tags,
  timestamps, status text, keybinds. Lowercase, letter-spaced. This font is what
  makes the design read as a window manager; use it for anything that is
  *interface* rather than *reading*.

**Serif for what you read, mono for what you operate.** Sans prose beside mono
chrome is the default developer-portfolio pairing and says nothing in
particular; the serif says the writing is the point, which is the claim this
site exists to make. Source Serif 4 specifically because it is drawn for screens
and has stems sturdy enough for a true-black ground — a delicate old-style face
goes thin here.

The Tailwind theme still calls it `--font-sans`, so existing `font-sans`
utilities keep working; the underlying variable is `--font-serif`. Italic is a
separate file, which is why the font payload is 137KB rather than 87KB. That
buys real italics for `<em>` and blockquotes, and measurably costs nothing —
LCP was 727ms before the swap and 727ms after.

**The ground is near-neutral on purpose.** When the page, the panes and the
accent all share one hue, nothing can stand out against anything and the result
reads as decoration rather than as a document — which is the wrong signal for an
audience of researchers and recruiters. Colour is reserved for meaning: links,
focus, and the active workspace. Pane dots are accent **only on the focused
pane**; status badges are `--muted`, not accent.

Every text token clears WCAG AA on both the ground and the pane fill, except
`--faint`, which is supplementary (counters, timestamps) and clears the 3:1 UI
floor at 4.01. Verify with composited alpha, not `getComputedStyle` alone — the
active pill sits on a 10%-opacity wash, and treating that as opaque reports a
false failure.

Ambient background is a single `position: fixed` layer holding the 44px grid.
One element, painted once — never per-pane backgrounds. The two radial glows it
used to carry were removed: they were the main thing tinting the whole page one
colour, and the element most likely to read as trying too hard.

## Things that carry over

- **OG images cannot read tokens.** `src/lib/og.tsx` hard-codes its three
  colours because it renders outside a browser. They must be updated by hand to
  the palette above, or the social cards will not match the site.
- **Prose styles are hand-written** in `globals.css` (no typography plugin) and
  cover KaTeX and Shiki output. Restyling article text happens there. Shiki
  currently emits both light and dark themes with CSS picking one; going
  dark-only means pinning it to a single theme.
- **The RSS feed carries summaries, not full bodies.** Article HTML contains
  rendered KaTeX markup that feed readers mangle; a link beats broken equations.
  It covers **research, projects and /now together**, newest first, each item
  tagged with a `<category>`. It was research-only, which meant the thing
  published most often could not be followed at all. /now entries have no
  `summary`, so they use `excerpt` — plain text taken from the Markdown source,
  never from the rendered HTML, which would drag KaTeX's duplicated MathML in.

- **Headings are linkable.** `rehype-slug` sets the ids and
  `rehype-autolink-headings` appends the `#`. It is hidden below `md`: there is
  no hover to reveal it and a `#` could never be a 44px target. The ids still
  resolve, so sections stay addressable on any device.

- **The contents list** in `MetaPane` comes from `extractHeadings()`, read back
  out of the rendered HTML so the ids are guaranteed to match the anchors.
  Desktop only — below `lg` the metadata pane sits *after* the article, where a
  contents list would only be seen by someone who has already scrolled past
  everything it points at.

## Verifying a redesign change

Check **both viewport sizes**, and check a research article page specifically —
it exercises maths, code blocks and tables. `pnpm build` must pass before
claiming a change works.

## Phase status

- ✅ Phase 1 — tokens, fonts, Waybar, WorkspacePills, Pane, PaneHeader, ambient layer
- ✅ Phase 2 — existing routes wired through the shell
- ✅ Phase 3 — the three responsive layout modes
- ✅ Phase 4 — motion (see the `hypr-motion` skill, and "Motion" above for the
  two items deliberately left out)
- ✅ Phase 5 — `/mobile-audit` and fixes. Measured on an emulated mid-range
  Android (412×915, 4× CPU, Slow 4G): LCP 741ms, CLS 0.00, 0 long tasks, 139KB
  JS gzipped, no third-party requests. Re-run it after any layout change.
- ✅ Phase 6 — CommandPalette, keybind footer, polish

The polish pass caught a bug that predated the redesign: **an arbitrary text
utility built from a bare `var()` compiles to `color`, not `font-size`.**
Tailwind cannot tell whether the variable holds a length or a colour and assumes
colour, so the declaration was invalid and every heading rendered at inherited
body size — the homepage `h1` measured 15px where the token says 36px. The fix
is the explicit `length:` hint, as in `text-[length:var(--text-3xl)]`. Colour
tokens (`--text-muted`, `--text-2`, …) were correct as they were and were left
alone.

---

## Pre-redesign status (all shipped and live)

- ✅ Foundation, design tokens, content pipeline, homepage
- ✅ Projects, research, now, about, tag pages, tag filtering
- ✅ `/admin` dashboard
- ✅ GitHub activity on `/about` (`lib/github-activity.ts`).
  Authenticated only: unauthenticated calls are 60/hour *per IP* and Vercel
  shares outgoing IPs between customers, so they fail unpredictably. Cached with
  ISR (`revalidate: 3600`), not cron — Hobby caps cron at once daily. Every
  function returns null on failure and the section hides itself; do not "fix"
  this by throwing. Awaited directly rather than wrapped in Suspense — the page
  is static, so a skeleton would only flash a section that may not exist.
- ✅ OG images (`lib/og.tsx` + per-route `opengraph-image.tsx`), `sitemap.ts`,
  `robots.ts`, `feed.xml`, `not-found.tsx`

## Environment variables

`ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`
(optionally `GITHUB_BRANCH`, defaults to `main`). Generate the first two with
`pnpm setup`. The site builds and serves fine without any of them — only
`/admin` needs them.

The full original plan is at `~/.claude/plans/how-to-create-a-unified-babbage.md`.
