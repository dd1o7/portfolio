# The prompt sequence

Six phases. Run them in order. `/clear` between phases and commit at the end of each —
otherwise phase 4's context is clogged with phase 1's file reads and quality drops.

Use **plan mode** (`Shift+Tab` twice) for phases 1, 2 and 3. Read the plan, push back on
anything you disagree with, then approve. Claude writing 30 files from a plan you skimmed
is the main way this goes wrong.

---

## Phase 0 — Set the ground truth

```
Read CLAUDE.md, then explore this repo and tell me what's actually here:
the routing structure, how markdown content is loaded and typed, where
styles live, and which parts of the current design are load-bearing for
the RSS feed and OG image generation.

Don't write any code yet. I want to know what I'd break.
```

Then, once per project:

```
/run-skill-generator
```

This records how to build and launch the site into `.claude/skills/run-portfolio/`, so
`/run` and `/verify` stop guessing at it for the rest of the project.

---

## Phase 1 — The shell, static

```
Build the WM shell as static markup — no animation, no interaction yet.

- Define the design tokens from CLAUDE.md as CSS custom properties in
  globals.css and expose them to Tailwind.
- Set up Inter and JetBrains Mono through next/font, self-hosted and subset.
- Build Waybar, WorkspacePills, Pane, PaneHeader per the wm-shell skill.
- Build the single fixed ambient background layer: the two radial glows
  and the 44px grid, in one element.
- Put a placeholder pane on the homepage so I can see it.

Plan first. I want to review the component boundaries before you write files.
```

Then look at it at 380px and 1440px before going further. Do not proceed until both look
right — everything after this compounds on it.

---

## Phase 2 — Routes into panes

```
Wire the existing routes through the shell. /, /projects, /research, /now
and /about each render their markdown content inside a Pane with the right
path label and counter.

Workspaces stay real routes — I don't want client-side state swapping.
Keep /feed.xml, the OG image route, and every existing URL working exactly
as they do now.

Also move math rendering to build time with remark-math and rehype-katex,
and delete the client KaTeX scripts.
```

Verify before moving on:

```
/verify the site builds, all five routes render, /feed.xml still returns
valid RSS, and no katex JS is requested by the browser
```

---

## Phase 3 — The three layout modes

```
Implement the responsive layout modes from CLAUDE.md.

Desktop (≥1024): MasterStack with the draggable SplitDivider and
drag-to-reorder stack.
Tablet (640–1024): two panes maximum, stacked vertically, no drag.
Mobile (<640): one pane per screen inside WorkspaceSwiper, stack panes
scrolling below, pane headers at 44px, solid pane fill with no
backdrop-filter.

Gate the desktop-only components on a media query hook so they don't mount
on mobile at all — don't hide them with CSS.
```

---

## Phase 4 — Motion

```
Add the animations from the hypr-motion skill. Bezier tokens in globals.css
first, then the motion table in order: pane enter/exit, the direction-aware
workspace slide, the focus glow, hovers.

The desktop slide runs through View Transitions; the mobile slide follows
the finger during the swipe and completes past threshold. Both use
--ease-wind so they feel like one interface.

Add the prefers-reduced-motion block and wire useReducedMotion in Motion.
```

---

## Phase 5 — Measure

```
/mobile-audit
```

Then fix in the order the audit reports. Re-run it on the routes you changed. Expect the
first run to fail on several things — that is what it is for.

Finally, on a real Android phone over your local network:

```
npm run build && npm run start -- -H 0.0.0.0
```

The emulator is optimistic about `backdrop-filter` and about high-refresh scrolling. Some
problems only appear on hardware.

---

## Phase 6 — Polish

```
Add the CommandPalette: SUPER K on desktop, a full-screen sheet from the
waybar search button on mobile. It searches projects, notes and reading
entries, and every action it exposes must also be reachable by clicking
something visible.
```

Then, separately: the keybind footer, the contribution heatmap, the phase progress bars.

---

## Prompts worth reusing

**When something feels off but you can't name it:**

```
Take a screenshot of / at 412px and at 1440px and tell me what looks wrong
against the wm-shell conventions. Be specific about which rule each problem
breaks.
```

**Before you merge anything:**

```
/code-review
```

**When Claude drifts from the design:**

```
You've introduced hex literals / centered text / a bold heading. Re-read the
wm-shell skill and fix every instance in the files you just touched.
```

**When an animation feels heavy:**

```
Record a performance trace of the workspace swipe at 4x CPU throttle and
tell me which property is causing style recalculation. Name the exact CSS
rule, don't guess.
```

---

## The one decision to make yourself

Someone lands on `/projects` from a Google result, on a phone, with no idea what a
workspace is. Either the projects list is visible with zero interaction, or the swipe
affordance is obvious within a second. Decide which before phase 3 — it is a content
hierarchy call, not a technical one, and Claude will happily build either.
