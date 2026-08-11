"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";

/** Formats that must not go through the canvas: one is vector, one animates. */
const PASS_THROUGH = new Set(["svg", "gif"]);

/**
 * Shrink an image in the browser before uploading it.
 *
 * This is what makes uploading from a phone work — a modern phone photo is
 * 3–8 MB, which is awkward to push through the GitHub API and pointless on a
 * web page. Resized and re-encoded, the same photo lands around 100–300 KB.
 */
async function prepareImage(file: File): Promise<{ dataUrl: string; filename: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (PASS_THROUGH.has(ext)) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });
    return { dataUrl, filename: file.name };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // WebP keeps transparency and is far smaller than PNG for screenshots.
  const dataUrl = canvas.toDataURL("image/webp", 0.85);
  const stem = file.name.replace(/\.[^.]+$/, "");
  return { dataUrl, filename: `${stem}.webp` };
}

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [html, setHtml] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Render the preview through the same pipeline the published page uses.
  useEffect(() => {
    if (tab !== "preview") return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: value }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setHtml(data.html);
          setPreviewError(null);
        } else {
          setPreviewError(data.error ?? "Could not render preview.");
        }
      } catch {
        if (!cancelled) setPreviewError("Could not reach the server.");
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tab, value]);

  /** Drop text in at the cursor rather than at the end. */
  function insertAtCursor(snippet: string) {
    const el = textarea.current;
    if (!el) {
      onChange(`${value}\n\n${snippet}`);
      return;
    }
    const { selectionStart: start, selectionEnd: end } = el;
    onChange(value.slice(0, start) + snippet + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + snippet.length;
    });
  }

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const { dataUrl, filename } = await prepareImage(file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      insertAtCursor(`\n![](${data.url})\n`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <TabButton active={tab === "write"} onClick={() => setTab("write")}>
            write
          </TabButton>
          <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
            preview
          </TabButton>
        </div>

        <label
          className={cx(
            "mono cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]",
            uploading && "pointer-events-none opacity-50",
          )}
        >
          {uploading ? "uploading…" : "+ image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {uploadError && (
        <p role="alert" className="mono mb-2 text-[var(--status-draft)]">
          {uploadError}
        </p>
      )}

      {tab === "write" ? (
        <textarea
          ref={textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
          rows={22}
          placeholder={"Write in Markdown.\n\nMaths works: $E = mc^2$ inline, $$…$$ on its own line."}
          className="mono w-full resize-y rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 leading-relaxed outline-none focus:border-[var(--accent)]"
        />
      ) : (
        <div className="min-h-[20rem] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5">
          {previewError ? (
            <p className="mono text-[var(--status-draft)]">{previewError}</p>
          ) : value.trim() === "" ? (
            <p className="mono text-[var(--text-faint)]">Nothing to preview yet.</p>
          ) : (
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "mono rounded-[var(--radius-sm)] border px-2 py-1 transition-colors",
        active
          ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]",
      )}
    >
      {children}
    </button>
  );
}
