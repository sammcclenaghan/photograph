"use server"

import { db } from "~/server/db";
import { galleries, images } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export async function createGallery(formData: FormData) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string || "";
  if (!name) throw new Error("Gallery name is required");

  const [gallery] = await db.insert(galleries).values({
    name,
    description,
    userId: user.userId,
  }).returning();

  return gallery;
}

export async function getImages(galleryId: number) {
  const user = await auth()
  if (!user.userId) throw new Error("Unauthorized")

  const userImages = await db.query.images.findMany({
    where: (model, { eq, and }) =>
      and(eq(model.userId, user.userId), eq(model.galleryId, galleryId)),
    orderBy: (model, { desc }) => desc(model.id),
  })

  return userImages
}

export async function deleteGallery(galleryId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await db.delete(galleries)
    .where(and(eq(galleries.id, galleryId), eq(galleries.userId, userId)));
}

export async function updateGallery(galleryId: number, formData: FormData) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string || "";
  if (!name) throw new Error("Gallery name is required");

  const [updatedGallery] = await db.update(galleries)
    .set({ name, description })
    .where(and(eq(galleries.id, galleryId), eq(galleries.userId, user.userId)))
    .returning();

  return updatedGallery;
}

export async function updateGalleryCoverPhoto(galleryId: number, coverPhotoUrl: string) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const [updatedGallery] = await db.update(galleries)
    .set({ coverPhotoUrl })
    .where(and(eq(galleries.id, galleryId), eq(galleries.userId, user.userId)))
    .returning();

  return updatedGallery;
}

export async function updateGalleryCoverColor(galleryId: number, coverColor: string) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const [updatedGallery] = await db.update(galleries)
    .set({ coverColor })
    .where(and(eq(galleries.id, galleryId), eq(galleries.userId, user.userId)))
    .returning();

  return updatedGallery;
}

export async function deleteImage(imageId: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  await db.delete(images)
    .where(and(eq(images.id, imageId), eq(images.userId, user.userId)));

  return true;
}
