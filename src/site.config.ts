/**
 * Everything personal about this site lives here.
 *
 * If you change nothing else in the codebase, change this file. Your name,
 * links, and what the site says about you are all below.
 */

export const siteConfig = {
  /** Shown in the header and used as the base of every page title. */
  name: "Dewanshu",

  /** Your GitHub username — drives the GitHub activity section. */
  githubHandle: "dd1o7",

  /** One line under your name on the homepage. */
  tagline: "Physics-informed neural networks, quantitative finance, and things in between.",

  /** A short paragraph for the homepage. Longer bio goes in content/site/about.md */
  intro:
    "I work on physics-informed neural networks, quantitative finance, and assorted problems across tech and science. This site is where I keep track of what I'm building and what I'm reading.",

  /** Full site URL once deployed. Update after your first Vercel deploy. */
  url: "https://example.vercel.app",

  /** Used for SEO and social previews. */
  description:
    "Projects, research and notes on physics-informed neural networks, quantitative finance, and applied science.",

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
