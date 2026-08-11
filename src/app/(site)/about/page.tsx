import type { Metadata } from "next";
import { getAbout } from "@/lib/content";
import { hasResume } from "@/lib/resume";
import { GitHubActivity } from "@/components/GitHubActivity";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
};

/** Refresh the GitHub data hourly. */
export const revalidate = 3600;

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <div className="container-page py-16">
      <header className="mb-8">
        <h1 className="text-[var(--text-2xl)] font-semibold tracking-tight">
          {about?.title ?? "About"}
        </h1>
      </header>

      {about ? (
        <div className="prose" dangerouslySetInnerHTML={{ __html: about.html }} />
      ) : (
        <p className="mono text-[var(--text-faint)]">
          Add content/site/about.md to fill this page.
        </p>
      )}

      {hasResume() && (
        <div className="hairline mt-12 pt-6">
          <a
            href={siteConfig.resume.path}
            target="_blank"
            rel="noopener noreferrer"
            className="mono link-accent link-underline"
          >
            {siteConfig.resume.label} (PDF) ↗
          </a>
        </div>
      )}

      {/* Awaited directly rather than streamed: this page is statically
          generated and revalidated hourly, so the fetch happens in the
          background and never on a visitor's request. */}
      <GitHubActivity />
    </div>
  );
}
