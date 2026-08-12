/**
 * Everything personal about this site lives here.
 *
 * If you change nothing else in the codebase, change this file. Your name,
 * links, and what the site says about you are all below.
 */

export const siteConfig = {
  /** Shown in the header and used as the base of every page title. */
  name: "Dewanshu Dewangan",

  /** Your GitHub username — drives the GitHub activity section. */
  githubHandle: "dd1o7",

  /** One line under your name on the homepage. */
  tagline: "Learning machine learning from first principles, toward physics-informed methods.",

  /** A short paragraph for the homepage. Longer bio goes in content/site/about.md */
  intro:
    "I'm a student working toward research in physics-informed machine learning — starting from the mathematics and building up, in public. I read about quantitative finance on the side. This site is where I keep track of what I'm learning and what I'm reading.",

  /** Full site URL. Used for link previews and the sitemap. */
  url: "https://portfolio-dd1o7.vercel.app",

  /** Used for SEO and social previews. */
  description:
    "Student notes, projects and reading on machine learning from first principles, working toward physics-informed methods.",

  /** Contact and social links. Leave a value empty ("") to hide that link. */
  links: {
    email: "dewanshu02d@gmail.com",
    github: "https://github.com/dd1o7",
    linkedin: "",
    x: "",
    scholar: "",
  },

  /**
   * Résumé / CV.
   *
   * Drop your PDF at `public/resume.pdf` and the link appears by itself in the
   * nav and on the About page — there is nothing to switch on. Until the file
   * exists the link stays hidden, so it never points at a missing page.
   * Set `enabled: false` to hide it even when the file is present.
   */
  resume: {
    enabled: true,
    path: "/resume.pdf",
    label: "Résumé",
  },

  /** Main navigation, in order. */
  nav: [
    { href: "/projects", label: "projects" },
    { href: "/research", label: "research" },
    { href: "/now", label: "now" },
    { href: "/about", label: "about" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * The links above that actually have a value, in a fixed order.
 *
 * Leaving one empty in `links` hides it everywhere it appears, so there is only
 * ever one place to edit.
 */
export function contactLinks(): { label: string; href: string }[] {
  const { email, github, linkedin, x, scholar } = siteConfig.links;
  return [
    email && { label: "email", href: `mailto:${email}` },
    github && { label: "github", href: github },
    linkedin && { label: "linkedin", href: linkedin },
    x && { label: "x", href: x },
    scholar && { label: "scholar", href: scholar },
  ].filter(Boolean) as { label: string; href: string }[];
}
