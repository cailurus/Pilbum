import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PhotoDetail } from "./photo-detail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [photo] = await db
    .select()
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);

  if (!photo) return { title: "Photo not found" };

  return {
    title: photo.title ? `${photo.title} - Pilbum` : "Pilbum",
    description: photo.description || undefined,
  };
}

export default async function PhotoPage({ params }: Props) {
  const { id } = await params;
  const [photo] = await db
    .select()
    .from(photos)
    .where(eq(photos.id, id))
    .limit(1);

  if (!photo) notFound();

  return <PhotoDetail photo={photo} />;
}
