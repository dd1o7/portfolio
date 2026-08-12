/**
 * Content pipeline.
 *
 * Reads Markdown files from `content/`, checks the frontmatter is valid, and
 * turns the body into HTML (with LaTeX maths and syntax-highlighted code).
 *
 * Every page on the site gets its content through the functions in this file,
 * so there is exactly one place where content rules are defined.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const CONTENT_DIR = path.join(process.cwd(), "content");

/* ==========================================================================
   Schemas — the shape every content file must follow
   ========================================================================== */

/**
 * A YYYY-MM-DD date.
 *
 * YAML turns an unquoted `2026-08-11` into a JavaScript Date but leaves
 * `"2026-08-11"` as a string. Both are normalised here so it does not matter
 * which one you write in frontmatter.
 */
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date in YYYY-MM-DD form, e.g. 2026-08-11"),
);

/** Fields shared by projects and research notes. */
const baseFields = {
  title: z.string().min(1, "cannot be empty"),
  summary: z.string().min(1, "cannot be empty — this is the one-line description in listings"),
  date: isoDate,
  tags: z.array(z.string()).default([]),
  /** Draft items are visible when running locally, hidden on the live site. */
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
};

const projectSchema = z.object({
  ...baseFields,
  status: z.enum(["active", "shipped", "archived"]).default("active"),
  stack: z.array(z.string()).default([]),
  cover: z.string().optional(),
  links: z
    .object({
      repo: z.string().optional(),
      demo: z.string().optional(),
      paper: z.string().optional(),
    })
    .default({}),
});

const researchSchema = z.object({
  ...baseFields,
  links: z
    .object({
      arxiv: z.string().optional(),
      pdf: z.string().optional(),
      doi: z.string().optional(),
      code: z.string().optional(),
    })
    .default({}),
});

const nowSchema = z.object({
  date: isoDate,
  title: z.string().optional(),
  draft: z.boolean().default(false),
});

const aboutSchema = z.object({
  title: z.string().default("About"),
});

/* ==========================================================================
   Types
   ========================================================================== */

export type Project = z.infer<typeof projectSchema> & { slug: string; html: string };
export type Research = z.infer<typeof researchSchema> & { slug: string; html: string };
export type NowEntry = z.infer<typeof nowSchema> & { slug: string; html: string };
export type About = z.infer<typeof aboutSchema> & { html: string };

/** Anything that can appear in a tag listing. */
export type TaggedItem = (Project | Research) & { kind: "project" | "research" };

/* ==========================================================================
   Markdown → HTML
   ========================================================================== */

const prettyCodeOptions: PrettyCodeOptions = {
  // The site is dark only, so one theme is enough. With a single theme Shiki
  // writes token colours as inline styles; globals.css no longer picks between
  // a light and a dark set.
  theme: "github-dark-dimmed",
  keepBackground: false,
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeKatex)
  .use(rehypePrettyCode, prettyCodeOptions)
  .use(rehypeStringify, { allowDangerousHtml: true });

/** Render a Markdown string to HTML. Used by pages and by the admin preview. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

/* ==========================================================================
   Reading files
   ========================================================================== */

/**
 * Turns a Zod failure into a message that names the file and the field, so a
 * typo in frontmatter is obvious instead of being a stack trace.
 */
function formatValidationError(relPath: string, error: z.ZodError): string {
  const lines = error.issues.map((issue) => {
    const field = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `  • ${field}: ${issue.message}`;
  });
  return `\nInvalid frontmatter in content/${relPath}\n${lines.join("\n")}\n`;
}

function readDir(dir: string): string[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .sort();
}

async function readOne<T extends z.ZodTypeAny>(
  dir: string,
  filename: string,
  schema: T,
): Promise<z.infer<T> & { slug: string; html: string }> {
  const relPath = path.join(dir, filename);
  const raw = fs.readFileSync(path.join(CONTENT_DIR, relPath), "utf8");
  const { data, content } = matter(raw);

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(formatValidationError(relPath, parsed.error));
  }

  // The cast is needed because TypeScript cannot know a generic Zod schema
  // infers to an object type; every schema in this file does.
  return {
    ...(parsed.data as object),
    slug: filename.replace(/\.mdx?$/, ""),
    html: await renderMarkdown(content),
  } as z.infer<T> & { slug: string; html: string };
}

async function readAll<T extends z.ZodTypeAny>(dir: string, schema: T) {
  return Promise.all(readDir(dir).map((f) => readOne(dir, f, schema)));
}

/**
 * Drafts are visible locally so you can preview work in progress, and hidden
 * on the live site.
 */
function visible<T extends { draft: boolean }>(items: T[]): T[] {
  if (process.env.NODE_ENV === "development") return items;
  return items.filter((item) => !item.draft);
}

/** Newest first. */
function byDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

/* ==========================================================================
   Public API
   ========================================================================== */

export async function getProjects(): Promise<Project[]> {
  return byDateDesc(visible(await readAll("projects", projectSchema)));
}

export async function getProject(slug: string): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export async function getResearch(): Promise<Research[]> {
  return byDateDesc(visible(await readAll("research", researchSchema)));
}

export async function getResearchItem(slug: string): Promise<Research | null> {
  const all = await getResearch();
  return all.find((r) => r.slug === slug) ?? null;
}

export async function getNowEntries(): Promise<NowEntry[]> {
  return byDateDesc(visible(await readAll("now", nowSchema)));
}

/** The most recent /now entry — what you are working on right now. */
export async function getCurrentNow(): Promise<NowEntry | null> {
  const entries = await getNowEntries();
  return entries[0] ?? null;
}

/**
 * A standalone page under `content/site/`.
 *
 * These are the pages that are prose rather than a collection — the homepage
 * introduction and the about page. Missing is not an error: the route falls
 * back to whatever it showed before the file existed.
 */
async function getSiteDoc(name: string): Promise<About | null> {
  const file = path.join(CONTENT_DIR, "site", `${name}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const parsed = aboutSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(formatValidationError(`site/${name}.md`, parsed.error));
  }
  return { ...parsed.data, html: await renderMarkdown(content) };
}

export async function getAbout(): Promise<About | null> {
  return getSiteDoc("about");
}

/** The homepage introduction. Falls back to `siteConfig.intro` when absent. */
export async function getHome(): Promise<About | null> {
  return getSiteDoc("home");
}

/** Every tag used anywhere, with how many items use it. Most used first. */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const [projects, research] = await Promise.all([getProjects(), getResearch()]);
  const counts = new Map<string, number>();
  for (const item of [...projects, ...research]) {
    for (const tag of item.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Projects and research sharing a tag, newest first. */
export async function getItemsByTag(tag: string): Promise<TaggedItem[]> {
  const [projects, research] = await Promise.all([getProjects(), getResearch()]);
  const items: TaggedItem[] = [
    ...projects.map((p) => ({ ...p, kind: "project" as const })),
    ...research.map((r) => ({ ...r, kind: "research" as const })),
  ];
  return byDateDesc(items.filter((i) => i.tags.some((t) => slugifyTag(t) === slugifyTag(tag))));
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, "-");
}
