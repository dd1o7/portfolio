"use client";

import { useEffect, useState } from "react";

/**
 * Waybar clock.
 *
 * Renders nothing on the server and fills in after mount. A server-rendered
 * time is a guaranteed hydration mismatch — the HTML is generated at build
 * time, so it would never match the browser's clock.
 *
 * The reserved width stops the waybar shifting when the time appears.
 */
export function Clock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      );

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="mono max-sm:hidden w-[5ch] shrink-0 text-right text-[var(--faint)] tabular-nums">
      {time}
    </span>
  );
}
