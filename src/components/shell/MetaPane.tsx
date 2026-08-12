import Link from "next/link";
import { Pane } from "./Pane";
import { slugifyTag } from "@/lib/content";

type Field = { label: string; value: React.ReactNode };
type ExternalLink = { label: string; href: string };

/**
 * The stack pane beside an article: everything from the file's frontmatter that
 * is not the body — date, status, links, tags.
 *
 * On desktop this sits alongside the body pane; below `lg` it follows it. The
 * article pages own the field list, because projects and research notes carry
 * different frontmatter; the styling lives here so both look identical.
 */
export function MetaPane({
  fields,
  links,
  tags,
}: {
  fields: Field[];
  links: ExternalLink[];
  tags: readonly string[];
}) {
  return (
    <Pane label="metadata">
      <dl className="mono flex flex-col gap-y-2">
        {fields.map((field) => (
          <div key={field.label} className="flex items-baseline gap-3">
            <dt className="w-[4.5rem] shrink-0 text-[var(--accent-bright)]">{field.label}</dt>
            <dd className="min-w-0 text-[var(--text-2)]">{field.value}</dd>
          </div>
        ))}
      </dl>

      {links.length > 0 && (
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <h2 className="mono text-[var(--dim)]">links</h2>
          <ul className="mt-2 flex flex-col gap-y-1">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono link-accent link-underline tap-target"
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <h2 className="mono text-[var(--dim)]">tags</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${slugifyTag(tag)}`}
                /* Deliberately small only on desktop — a 44px target below md. */
                className="mono inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-[var(--border)] px-3 text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] md:h-7 md:px-2.5"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </Pane>
  );
}
