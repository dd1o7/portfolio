"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getValue, setValue, type Field } from "@/lib/collections";
import { MarkdownEditor } from "./MarkdownEditor";
import { cx } from "@/lib/utils";

type Props = {
  collectionKey: string;
  fields: Field[];
  /** null when creating something new. */
  slug: string | null;
  initialFrontmatter: Record<string, unknown>;
  initialBody: string;
  sha?: string;
};

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; url?: string; commitUrl: string }
  | { kind: "error"; message: string };

export function EntryForm({
  collectionKey,
  fields,
  slug,
  initialFrontmatter,
  initialBody,
  sha,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>>(initialFrontmatter);
  const [body, setBody] = useState(initialBody);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [confirmDelete, setConfirmDelete] = useState(false);

  function update(path: string, value: unknown) {
    setData((previous) => {
      const next = structuredClone(previous);
      setValue(next, path, value);
      return next;
    });
    setStatus({ kind: "idle" });
  }

  const missing = fields
    .filter((f) => "required" in f && f.required)
    .filter((f) => !String(getValue(data, f.name) ?? "").trim())
    .map((f) => f.label);

  async function save() {
    if (missing.length > 0) {
      setStatus({ kind: "error", message: `Still needed: ${missing.join(", ")}.` });
      return;
    }

    setStatus({ kind: "saving" });

    const res = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection: collectionKey, slug, frontmatter: data, body, sha }),
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus({ kind: "error", message: result.error ?? "Could not save." });
      return;
    }

    setStatus({ kind: "saved", url: result.url, commitUrl: result.commitUrl });

    // A new entry now lives at its own URL, so move the editor there.
    if (!slug && result.slug) {
      router.replace(`/admin/edit/${collectionKey}/${result.slug}`);
    }
    router.refresh();
  }

  async function remove() {
    setStatus({ kind: "saving" });
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection: collectionKey, slug }),
    });
    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus({ kind: "error", message: result.error ?? "Could not delete." });
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[20rem_1fr]">
      {/* Fields ---------------------------------------------------------- */}
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={getValue(data, field.name)}
            onChange={(value) => update(field.name, value)}
          />
        ))}
      </div>

      {/* Body + actions -------------------------------------------------- */}
      <div>
        <MarkdownEditor value={body} onChange={setBody} />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={status.kind === "saving"}
            className="mono rounded-[var(--radius)] bg-[var(--accent)] px-4 py-2 text-[var(--accent-contrast)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {status.kind === "saving" ? "publishing…" : slug ? "save changes" : "publish"}
          </button>

          {slug && (
            <button
              type="button"
              onClick={() => (confirmDelete ? remove() : setConfirmDelete(true))}
              onBlur={() => setConfirmDelete(false)}
              className={cx(
                "mono rounded-[var(--radius)] border px-3 py-2 transition-colors",
                confirmDelete
                  ? "border-[var(--status-draft)] text-[var(--status-draft)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]",
              )}
            >
              {confirmDelete ? "click again to confirm" : "delete"}
            </button>
          )}

          {missing.length > 0 && (
            <span className="mono text-[var(--text-faint)]">needs: {missing.join(", ")}</span>
          )}
        </div>

        {status.kind === "error" && (
          <p role="alert" className="mono mt-3 text-[var(--status-draft)]">
            {status.message}
          </p>
        )}

        {status.kind === "saved" && (
          <div className="mono mt-3 text-[var(--status-active)]">
            Saved and committed. The live site updates in about a minute.
            <div className="mt-1 flex flex-wrap gap-4">
              <a
                href={status.commitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent link-underline"
              >
                view commit ↗
              </a>
              {status.url && (
                <a
                  href={status.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent link-underline"
                >
                  view page ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   One input per field type
   ========================================================================== */

const inputClass =
  "mono w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = `field-${field.name}`;

  if (field.type === "boolean") {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-start gap-2">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 accent-[var(--accent)]"
        />
        <span>
          <span className="text-[var(--text-sm)]">{field.label}</span>
          {field.help && (
            <span className="block text-[var(--text-xs)] text-[var(--text-faint)]">
              {field.help}
            </span>
          )}
        </span>
      </label>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="label">
        {field.label}
        {"required" in field && field.required && (
          <span className="text-[var(--status-draft)]"> *</span>
        )}
      </label>

      {field.type === "select" ? (
        <select
          id={id}
          value={String(value ?? field.options[0])}
          onChange={(e) => onChange(e.target.value)}
          className={cx(inputClass, "mt-1.5")}
        >
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={id}
          rows={3}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className={cx(inputClass, "mt-1.5 resize-y")}
        />
      ) : field.type === "tags" ? (
        <input
          id={id}
          type="text"
          value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            )
          }
          className={cx(inputClass, "mt-1.5")}
        />
      ) : (
        <input
          id={id}
          type={field.type === "date" ? "date" : "text"}
          value={String(value ?? "")}
          placeholder={"placeholder" in field ? field.placeholder : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cx(inputClass, "mt-1.5")}
        />
      )}

      {field.help && (
        <p className="mt-1 text-[var(--text-xs)] text-[var(--text-faint)]">{field.help}</p>
      )}
    </div>
  );
}
