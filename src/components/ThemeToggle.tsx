"use client";

/**
 * Light/dark toggle.
 *
 * Deliberately holds no React state. The current theme already lives on the
 * <html> element (set before first paint by the inline script in layout.tsx),
 * so the button reads it from the DOM on click and CSS decides which icon to
 * show. That avoids both a hydration mismatch and a flash of the wrong icon.
 */
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const explicit = root.getAttribute("data-theme");
    const current =
      explicit ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private browsing can block localStorage; the toggle still works for
      // this page view, it just will not be remembered.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
    >
      {/* Shown in dark mode — click to go light. */}
      <svg
        className="theme-icon-sun"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>

      {/* Shown in light mode — click to go dark. */}
      <svg
        className="theme-icon-moon"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
