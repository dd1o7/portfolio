import Link from "next/link";
import { notFound } from "next/navigation";
import matter from "gray-matter";
import { getCollection, today } from "@/lib/collections";
import { getFile, isGitHubConfigured } from "@/lib/github";
import { EntryForm } from "@/components/admin/EntryForm";
import { NotConfigured } from "@/components/admin/NotConfigured";

/**
 * YAML turns unquoted dates into Date objects. The form works in strings, so
 * anything date-shaped is converted back before it reaches the client.
 */
function normalise(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      out[key] = value.toISOString().slice(0, 10);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = normalise(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export default async function EditPage({ params }: PageProps<"/admin/edit/[collection]/[slug]">) {
  const { collection: collectionKey, slug } = await params;

  const collection = getCollection(collectionKey);
  if (!collection) notFound();

  if (!isGitHubConfigured()) return <NotConfigured />;

  const isNew = slug === "new";

  let frontmatter: Record<string, unknown> = {};
  let body = "";
  let sha: string | undefined;

  if (isNew) {
    // Sensible starting values so a new entry is valid the moment it is saved.
    frontmatter = { date: today(), draft: false };
  } else {
    const file = await getFile(`${collection.dir}/${slug}.md`);
    if (!file) notFound();

    const parsed = matter(file.text);
    frontmatter = normalise(parsed.data);
    body = parsed.content.trim();
    sha = file.sha;
  }

  return (
    <div className="container-wide py-10">
      <Link href="/admin" className="mono link-accent">
        ← dashboard
      </Link>

      <h1 className="mt-4 text-[length:var(--text-xl)] font-semibold tracking-tight">
        {isNew ? `New ${collection.label.toLowerCase()}` : String(frontmatter.title ?? slug)}
      </h1>

      <EntryForm
        collectionKey={collection.key}
        fields={collection.fields}
        slug={isNew ? null : slug}
        initialFrontmatter={frontmatter}
        initialBody={body}
        sha={sha}
        deletable={collection.creatable !== false}
      />
    </div>
  );
}
