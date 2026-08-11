import { notFound } from "next/navigation";
import { getResearch, getResearchItem } from "@/lib/content";
import { OG_CONTENT_TYPE, OG_SIZE, ogImage } from "@/lib/og";

export const alt = "Research";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const research = await getResearch();
  return research.map((item) => ({ slug: item.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getResearchItem(slug);
  if (!item) notFound();

  return ogImage({ kind: "Research", title: item.title, subtitle: item.summary });
}
