/**
 * What the admin dashboard can edit.
 *
 * The form fields are described here rather than written out three times in
 * JSX, so adding a field to a content type means adding one line below.
 *
 * These definitions must stay in step with the Zod schemas in `content.ts`,
 * which are the real gatekeeper — the build fails if they disagree.
 */

export type Field =
  | { name: string; label: string; type: "text" | "textarea" | "date"; required?: boolean; help?: string; placeholder?: string }
  | { name: string; label: string; type: "tags"; help?: string; placeholder?: string }
  | { name: string; label: string; type: "boolean"; help?: string }
  | { name: string; label: string; type: "select"; options: string[]; help?: string };

export type Collection = {
  key: string;
  /** Singular, for buttons and headings. */
  label: string;
  labelPlural: string;
  dir: string;
  fields: Field[];
  /** How the filename is built when creating a new entry. */
  filename: "slug" | "date";
  /** Where this appears on the public site. */
  urlBase?: string;
};

const commonTail: Field[] = [
  { name: "draft", label: "Draft", type: "boolean", help: "Visible locally, hidden on the live site." },
];

export const collections: Record<string, Collection> = {
  projects: {
    key: "projects",
    label: "Project",
    labelPlural: "Projects",
    dir: "content/projects",
    filename: "slug",
    urlBase: "/projects",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "summary",
        label: "Summary",
        type: "textarea",
        required: true,
        help: "One line. This is what shows in listings.",
      },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "tags", label: "Tags", type: "tags", placeholder: "PINNs, finance", help: "Comma separated." },
      { name: "status", label: "Status", type: "select", options: ["active", "shipped", "archived"] },
      { name: "stack", label: "Stack", type: "tags", placeholder: "PyTorch, NumPy" },
      { name: "links.repo", label: "Repository URL", type: "text" },
      { name: "links.demo", label: "Demo URL", type: "text" },
      { name: "links.paper", label: "Paper URL", type: "text" },
      { name: "featured", label: "Featured", type: "boolean", help: "Show on the homepage." },
      ...commonTail,
    ],
  },

  research: {
    key: "research",
    label: "Research note",
    labelPlural: "Research",
    dir: "content/research",
    filename: "slug",
    urlBase: "/research",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true, help: "One line." },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "tags", label: "Tags", type: "tags", placeholder: "PINNs, notes" },
      { name: "links.arxiv", label: "arXiv URL", type: "text" },
      { name: "links.pdf", label: "PDF URL", type: "text" },
      { name: "links.doi", label: "DOI", type: "text" },
      { name: "links.code", label: "Code URL", type: "text" },
      { name: "featured", label: "Featured", type: "boolean" },
      ...commonTail,
    ],
  },

  now: {
    key: "now",
    label: "Update",
    labelPlural: "Now updates",
    dir: "content/now",
    filename: "date",
    urlBase: "/now",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "title", label: "Heading", type: "text", help: 'Optional. Defaults to "Currently".' },
      ...commonTail,
    ],
  },
};

export const collectionList = Object.values(collections);

export function getCollection(key: string): Collection | null {
  return collections[key] ?? null;
}

/* ==========================================================================
   Nested field values ("links.repo")
   ========================================================================== */

export function getValue(data: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, data);
}

export function setValue(data: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  const last = keys.pop()!;
  let target = data;
  for (const key of keys) {
    if (typeof target[key] !== "object" || target[key] === null) target[key] = {};
    target = target[key] as Record<string, unknown>;
  }
  target[last] = value;
}

/* ==========================================================================
   Frontmatter
   ========================================================================== */

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function serialize(value: unknown, indent: string): string | null {
  if (value === undefined || value === null || value === "") return null;

  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") return quote(value);

  if (Array.isArray(value)) {
    const items = value.filter((v) => v !== "" && v !== null && v !== undefined);
    if (items.length === 0) return null;
    return `[${items.map((v) => quote(String(v))).join(", ")}]`;
  }

  if (typeof value === "object") {
    const lines = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const rendered = serialize(v, indent + "  ");
        return rendered === null ? null : `${indent}  ${k}: ${rendered}`;
      })
      .filter(Boolean);
    return lines.length === 0 ? null : `\n${lines.join("\n")}`;
  }

  return null;
}

/**
 * Build a complete Markdown file from frontmatter data and a body.
 *
 * Every string is quoted, which keeps values containing colons, hashes or
 * leading digits from breaking the YAML.
 */
export function buildMarkdown(data: Record<string, unknown>, body: string): string {
  const lines = Object.entries(data)
    .map(([key, value]) => {
      const rendered = serialize(value, "");
      return rendered === null ? null : `${key}: ${rendered}`;
    })
    .filter(Boolean);

  return `---\n${lines.join("\n")}\n---\n\n${body.trim()}\n`;
}

/** Turn a title into a filename-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Today as YYYY-MM-DD, in UTC to match how dates are stored. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
