import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "@/site.config";

/**
 * Is there actually a résumé PDF to link to?
 *
 * Checked at build time so the link appears by itself once you drop the file
 * into `public/`, and never points at a missing file before that.
 */
export function hasResume(): boolean {
  return resumeMeta() !== null;
}

/**
 * Size and last-modified date of the résumé, read at build time.
 *
 * A recruiter's first question about a CV on a personal site is whether it is
 * current. A date answers that; a preview does not. Returns null when there is
 * no file, which is what hides every résumé affordance on the site.
 */
export function resumeMeta(): { path: string; sizeKb: number; updated: string } | null {
  if (!siteConfig.resume.enabled) return null;
  const file = path.join(process.cwd(), "public", siteConfig.resume.path.replace(/^\//, ""));
  if (!fs.existsSync(file)) return null;

  const stat = fs.statSync(file);
  return {
    path: siteConfig.resume.path,
    sizeKb: Math.max(1, Math.round(stat.size / 1024)),
    updated: stat.mtime.toISOString().slice(0, 10),
  };
}
