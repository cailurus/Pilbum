import { db } from "@/lib/db";
import { photos, settings, SETTING_KEYS } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PhotoDetail } from "./photo-detail";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

interface Props {
  params: Promise<{ id: string }>;
}

async function getSiteName(): Promise<string> {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, SETTING_KEYS.SITE_NAME))
      .limit(1);
    return result[0]?.value || siteConfig.name;
  } catch {
    return siteConfig.name;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [[photo], siteName] = await Promise.all([
    db.select().from(photos).where(eq(photos.id, id)).limit(1),
    getSiteName(),
  ]);

  if (!photo) return { title: "Photo not found" };

  return {
    title: photo.title ? `${photo.title} - ${siteName}` : siteName,
    description: photo.description || undefined,
  };
}

export default async function PhotoPage({ params }: Props) {
  const { id } = await params;
  const [[photo], siteName] = await Promise.all([
    db.select().from(photos).where(eq(photos.id, id)).limit(1),
    getSiteName(),
  ]);

  if (!photo) notFound();

  return <PhotoDetail photo={photo} siteName={siteName} />;
}
