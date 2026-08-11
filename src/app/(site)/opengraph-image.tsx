import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";
import { siteConfig } from "@/site.config";

export const alt = siteConfig.name;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Preview card for the homepage and any page without its own. */
export default async function Image() {
  return ogImage({ title: siteConfig.name, subtitle: siteConfig.tagline });
}
