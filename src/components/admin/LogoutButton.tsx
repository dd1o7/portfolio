"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="mono text-[var(--text-muted)] transition-colors hover:text-[var(--text)] disabled:opacity-50"
    >
      {busy ? "signing out…" : "sign out"}
    </button>
  );
}
