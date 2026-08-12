import type { Metadata } from "next";
import { MasterStack } from "@/components/shell/MasterStack";
import { Pane } from "@/components/shell/Pane";
import { getAbout } from "@/lib/content";
import { hasResume } from "@/lib/resume";
import { GitHubActivity } from "@/components/GitHubActivity";
import { contactLinks, siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: "About",
  description: siteConfig.description,
};

/** Refresh the GitHub data hourly. */
export const revalidate = 3600;

export default async function AboutPage() {
  const about = await getAbout();
  const links = contactLinks();

  const stack: React.ReactNode[] = [
    /* Awaited directly rather than streamed: this page is statically generated
       and revalidated hourly, so the fetch happens in the background and never
       on a visitor's request. It renders no pane at all when GitHub is
       unreachable. */
    <GitHubActivity key="github" />,
  ];

  if (links.length > 0) {
    stack.push(
      <Pane key="contact" label="~/contact">
        <ul className="mono flex flex-col gap-y-1">
          {links.map((link) => (
            <li key={link.label} className="flex items-baseline gap-3">
              <span className="w-[4.5rem] shrink-0 text-[var(--dim)]">{link.label}</span>
              <a
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="link-accent truncate"
              >
                {link.href.replace(/^mailto:|^https?:\/\//, "")}
              </a>
            </li>
          ))}
        </ul>
      </Pane>,
    );
  }

  return (
    <MasterStack
      master={
        <Pane label="~/about" focused>
          <div className="max-w-[var(--container)]">
            {about ? (
              <div className="prose" dangerouslySetInnerHTML={{ __html: about.html }} />
            ) : (
              <p className="mono text-[var(--faint)]">
                add content/site/about.md to fill this page.
              </p>
            )}

            {hasResume() && (
              <a
                href={siteConfig.resume.path}
                target="_blank"
                rel="noopener noreferrer"
                className="mono link-accent link-underline mt-8 inline-block"
              >
                {siteConfig.resume.label} (PDF) ↗
              </a>
            )}
          </div>
        </Pane>
      }
      stack={stack}
    />
  );
}
