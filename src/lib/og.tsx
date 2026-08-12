import { ImageResponse } from "next/og";
import { siteConfig } from "@/site.config";

/** Standard Open Graph card size. */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * The social preview card shown when a link to this site is shared.
 *
 * Rendered at build time into a PNG. The layout engine here supports only a
 * subset of CSS — flexbox works, grid does not, and any element with more than
 * one child needs an explicit `display: flex`.
 *
 * Colours are hard-coded rather than read from the design tokens because this
 * renders outside the browser, where CSS custom properties do not exist. If you
 * retheme the site, update every value below by hand — including the border
 * further down — or the social cards will not match.
 */
export function ogImage({ title, subtitle, kind }: { title: string; subtitle?: string; kind?: string }) {
  const bg = "#0d0f11";
  const text = "#e9ecef";
  const accent = "#4db6a0";
  const muted = "#9aa3ad";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: bg,
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {kind && (
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {kind}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 60 ? 60 : 72,
              color: text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 30,
                color: muted,
                lineHeight: 1.4,
              }}
            >
              {subtitle.length > 120 ? `${subtitle.slice(0, 117)}…` : subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #30383f",
            paddingTop: 28,
            fontSize: 26,
            color: muted,
          }}
        >
          <div style={{ display: "flex", color: text }}>{siteConfig.name}</div>
          <div style={{ display: "flex" }}>{siteConfig.url.replace("https://", "")}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
