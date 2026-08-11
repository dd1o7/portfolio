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
  if (!siteConfig.resume.enabled) return false;
  const file = path.join(process.cwd(), "public", siteConfig.resume.path.replace(/^\//, ""));
  return fs.existsSync(file);
}
