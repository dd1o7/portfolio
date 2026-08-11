# Portfolio

Personal site — projects, research notes, and a `/now` page, built to be updated
often without friction.

Content is Markdown in `content/`. There is no database: pushing to GitHub
redeploys the site automatically on Vercel.

**New here? Read [SETUP.md](./SETUP.md)** — it covers running the site locally,
putting it on GitHub, and deploying it, assuming no prior experience.

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · KaTeX for maths · Shiki for
code · Zod for content validation · Vercel Hobby (free)

## Adding content

Create a Markdown file in the right folder and push:

| Folder | Appears at |
|---|---|
| `content/projects/thing.md` | `/projects/thing` |
| `content/research/note.md` | `/research/note` |
| `content/now/2026-08-11.md` | `/now` |

Field reference is in [CLAUDE.md](./CLAUDE.md). Set `draft: true` to keep
something visible locally but hidden on the live site.
