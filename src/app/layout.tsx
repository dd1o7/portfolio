import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { siteConfig } from "@/site.config";

/**
 * next/font downloads these at build time and serves them from our own origin —
 * there is no runtime request to Google, and no `<link>` in the document.
 */
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    types: { "application/rss+xml": `${siteConfig.url}/feed.xml` },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

/**
 * Root layout — only the document shell.
 *
 * The public site's chrome lives in `(site)/layout.tsx`, and the admin has its
 * own in `admin/layout.tsx`, so the two never mix.
 *
 * The site is dark only, so there is no theme script here. `color-scheme: dark`
 * in globals.css and the meta tag below are what stop the browser painting a
 * white ground before our CSS lands.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#101d1c" />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
