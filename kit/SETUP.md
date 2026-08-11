# Setup

## Install

From your repo root:

```bash
mkdir -p .claude/skills
cp CLAUDE.md   /path/to/portfolio/CLAUDE.md
cp PROMPTS.md  /path/to/portfolio/PROMPTS.md
cp -r skills/* /path/to/portfolio/.claude/skills/
```

Commit all of it. Project skills in `.claude/skills/` are shared through version control
and load automatically in any session started in the repo.

Claude Code watches these directories, so edits to a `SKILL.md` take effect mid-session
without a restart.

## Add a browser

Phase 5 needs Claude to actually see the rendered page and measure it. Install the Chrome
DevTools MCP server:

```bash
claude mcp add chrome-devtools --scope user -- npx chrome-devtools-mcp@latest
```

Or install it as a plugin from https://claude.com/plugins/chrome-devtools-mcp

It gives Claude device emulation, CPU and network throttling, performance traces,
Lighthouse audits, console access, and screenshots. Without it, `/mobile-audit` cannot run
and Claude is guessing about what your site looks like.

## What each piece does

| File | Loads | Purpose |
|---|---|---|
| `CLAUDE.md` | Always, every session | Facts and invariants. Kept short on purpose — everything in it is a permanent token cost. |
| `skills/wm-shell/` | When Claude touches `app/**` or `components/**` | The component architecture. Scoped by `paths` so it doesn't load for unrelated work. |
| `skills/hypr-motion/` | Same scope | The animation vocabulary. Separate from wm-shell so a layout task doesn't pay for the motion reference. |
| `skills/mobile-audit/` | Only when you type `/mobile-audit` | `disable-model-invocation: true` — Claude cannot start a full build-and-trace run on its own. |
| `PROMPTS.md` | Never (it's for you) | The phase sequence to paste in. |

The split between CLAUDE.md and skills is deliberate: **facts go in CLAUDE.md, procedures
go in skills.** CLAUDE.md is in context for every message, so a procedure sitting there
costs tokens on every turn even when you're fixing a typo. A skill's body loads only when
it's used.

## Bundled skills you'll use

These ship with Claude Code — nothing to install:

- `/run-skill-generator` — run once, records how to build and launch this project
- `/verify` — builds and drives the app to confirm a change actually works, rather than
  trusting tests
- `/code-review` — review before merging
- `/doctor` — if a skill isn't triggering, this reports what's loaded and what it costs

## Checking it works

Start Claude Code in the repo and ask:

```
What skills are available?
```

You should see `wm-shell`, `hypr-motion` and `mobile-audit`. If a skill isn't triggering
when you expect it to, the usual cause is the `description` not containing words you
naturally use — edit it, and it reloads without a restart.

## Two things to watch

**Skills don't reload their content mid-conversation.** Once a skill's text enters the
conversation it stays as it was; Claude Code doesn't re-read the file on later turns. If
you edit a skill mid-task, re-invoke it with `/wm-shell` to load the new version.

**Review project skills before trusting a repo.** A skill can grant itself tool
permissions through `allowed-tools`. These three are yours and only pre-approve `npm run
build` and `npm run start`, but the same caution applies to anything you install from a
marketplace.
