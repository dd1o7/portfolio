"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      // `refresh` matters: the layout renders differently once signed in.
      router.replace(params.get("next") || "/admin");
      router.refresh();
      return;
    }

    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Could not sign in.");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <label htmlFor="password" className="label">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        autoComplete="current-password"
        className="mono mt-2 w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--accent)]"
      />

      {error && (
        <p role="alert" className="mono mt-3 text-[var(--status-draft)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || password.length === 0}
        className="mono mt-4 w-full rounded-[var(--radius)] bg-[var(--accent)] px-3 py-2 text-[var(--accent-contrast)] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {busy ? "checking…" : "sign in"}
      </button>
    </form>
  );
}

export function LoginForm() {
  // useSearchParams needs a Suspense boundary during prerendering.
  return (
    <Suspense fallback={<div className="mt-6 h-32" />}>
      <Form />
    </Suspense>
  );
}
