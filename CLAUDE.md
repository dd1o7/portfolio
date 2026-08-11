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

## Layout

```
content/            all site content (Markdown + YAML frontmatter)
  projects/*.md
  research/*.md
  now/*.md          one file per weekly update, named YYYY-MM-DD.md
  site/about.md
src/
  site.config.ts    all personal data — name, handle, links, nav
  app/globals.css   every design token; the whole theme lives here
  lib/content.ts    read + validate + render Markdown (used by every page)
  lib/utils.ts      date formatting, cx
  lib/resume.ts     build-time check for public/resume.pdf
  components/       EntryList (presentational), FilterableList (client), header, footer
```

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

## Conventions that matter

- **Design tokens only.** Colours and spacing come from CSS custom properties in
  `globals.css` (`var(--accent)`, `var(--text-muted)`, …). Never hard-code a hex
  value in a component — the theme is meant to be swappable from that one file.
- **Both themes, always.** Light and dark are defined three ways: bare `:root`,
  `prefers-color-scheme`, and `[data-theme]` for the manual toggle. A colour
  defined in only one of those breaks the toggle in one direction.
- **Reuse `EntryList`.** The homepage, both listing pages and tag pages all
  render through it. Do not write another list layout.
- **`lib/content.ts` is the only place that touches the filesystem for content.**
- **Maths and code already work.** KaTeX (`$…$` inline, `$$…$$` display) and
  Shiki highlighting are wired into the Markdown pipeline. Shiki emits both
  themes at once and CSS picks one — do not switch it to a single theme.

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

## Redesigning the UI — read this first

A redesign is planned. The site was built so this is a theming job, not a
rewrite. Before changing anything, understand the layers:

**Layer 1 — `src/app/globals.css` (start here).** Every colour, spacing value,
type size, radius and transition is a CSS custom property defined at the top of
this file. Changing the palette, the type scale or the density means editing
these values and nothing else. A large visual change is usually only this.

**Layer 2 — component classes.** Components reference tokens
(`text-[var(--text-muted)]`, `bg-[var(--surface)]`). They contain no hex values.
If a redesign needs a new *kind* of colour, add a token first, then use it —
never hard-code.

**Layer 3 — structure.** Changing layout (e.g. cards instead of rows) means
editing `components/EntryList.tsx`, which the homepage, `/projects`, `/research`
and tag pages all render through. Change it once, all four follow. Resist
writing a second list component.

### Rules that must survive a redesign

- **Three-state theming.** Light/dark is defined three times: bare `:root`
  (light), `@media (prefers-color-scheme: dark)` guarded with
  `:root:not([data-theme="light"])`, and `:root[data-theme="dark"]`. All three
  are required — defining a colour in only one breaks the manual toggle in one
  direction. The same pattern governs the toggle icons and Shiki's code colours.
- **No flash on load.** The inline script in `app/layout.tsx` applies the stored
  theme before first paint. It must stay inline and synchronous in `<head>`.
- **The toggle holds no React state** — it reads `data-theme` from the DOM and
  CSS picks the icon. Reintroducing `useState` here brings back a hydration
  mismatch and trips the `set-state-in-effect` lint rule.
- **OG images cannot read tokens.** `lib/og.tsx` hard-codes its three colours
  because it renders outside a browser. Retheme means updating them by hand, or
  the social cards will not match the site.
- **Prose styles are hand-written** in `globals.css` (no typography plugin) and
  cover KaTeX and Shiki output. Restyling article text happens there.

Verify a redesign in **both themes and both viewport sizes**, and check a
research page specifically — it exercises maths, code blocks and tables.

## Status

- ✅ Phase 1 — foundation, design tokens, content pipeline, homepage
- ✅ Phase 2 — projects, research, now, about, tag pages, tag filtering
- ✅ Phase 4 — `/admin` dashboard (built before Phase 3: it is the point of the
  project, and both phases need the same token)
- ✅ Phase 3 — GitHub activity on `/about` (`lib/github-activity.ts`).
  Authenticated only: unauthenticated calls are 60/hour *per IP* and Vercel
  shares outgoing IPs between customers, so they fail unpredictably. Cached with
  ISR (`revalidate: 3600`), not cron — Hobby caps cron at once daily. Every
  function returns null on failure and the section hides itself; do not "fix"
  this by throwing. Awaited directly rather than wrapped in Suspense — the page
  is static, so a skeleton would only flash a section that may not exist.
- ✅ Phase 5 — OG images (`lib/og.tsx` + per-route `opengraph-image.tsx`),
  `sitemap.ts`, `robots.ts`, `feed.xml`, `not-found.tsx`.

**OG image colours are hard-coded** in `lib/og.tsx`. They cannot read the CSS
design tokens because the image renders outside a browser. Retheming the site
means updating those three values by hand.

**The RSS feed carries summaries, not full bodies.** Article HTML contains
rendered KaTeX markup that feed readers mangle; a link beats broken equations.

## Environment variables

`ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `GITHUB_TOKEN`, `GITHUB_REPO`
(optionally `GITHUB_BRANCH`, defaults to `main`). Generate the first two with
`pnpm setup`. The site builds and serves fine without any of them — only
`/admin` needs them.

The full plan is at `~/.claude/plans/how-to-create-a-unified-babbage.md`.
