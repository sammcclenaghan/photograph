"use server";

import { db } from "~/server/db";
import { galleries, images } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { checkGalleryAccess } from "./queries";

export async function createGallery(formData: FormData) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || "";
  if (!name) throw new Error("Gallery name is required");

  const [gallery] = await db
    .insert(galleries)
    .values({
      name,
      description,
      userId: user.userId,
    })
    .returning();

  return gallery;
}

export async function getImages(galleryId: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if user has access to this gallery
  const hasAccess = await checkGalleryAccess(galleryId, user.userId);
  if (!hasAccess) throw new Error("Unauthorized");

  const galleryImages = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.galleryId, galleryId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return galleryImages;
}

export async function deleteGallery(galleryId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Only the gallery owner can delete the gallery
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId),
  });

  if (gallery?.userId !== userId) {
    throw new Error("Unauthorized - only gallery owner can delete a gallery");
  }

  await db.delete(galleries).where(eq(galleries.id, galleryId));
}

export async function updateGallery(galleryId: number, formData: FormData) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || "";
  if (!name) throw new Error("Gallery name is required");

  // Check if user has edit permission
  const canEdit = await checkGalleryAccess(galleryId, user.userId);
  if (!canEdit)
    throw new Error(
      "Unauthorized - you don't have edit permission for this gallery",
    );

  const [updatedGallery] = await db
    .update(galleries)
    .set({ name, description })
    .where(eq(galleries.id, galleryId))
    .returning();

  return updatedGallery;
}

export async function updateGalleryCoverPhoto(
  galleryId: number,
  coverPhotoUrl: string,
) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if user has edit permission
  const canEdit = await checkGalleryAccess(galleryId, user.userId);
  if (!canEdit)
    throw new Error(
      "Unauthorized - you don't have edit permission for this gallery",
    );

  const [updatedGallery] = await db
    .update(galleries)
    .set({ coverPhotoUrl })
    .where(eq(galleries.id, galleryId))
    .returning();

  return updatedGallery;
}

export async function updateGalleryCoverColor(
  galleryId: number,
  coverColor: string,
) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if user has edit permission
  const canEdit = await checkGalleryAccess(galleryId, user.userId);
  if (!canEdit)
    throw new Error(
      "Unauthorized - you don't have edit permission for this gallery",
    );

  const [updatedGallery] = await db
    .update(galleries)
    .set({ coverColor })
    .where(eq(galleries.id, galleryId))
    .returning();

  return updatedGallery;
}

export async function deleteImage(imageId: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // First get the image to check the gallery ID
  const image = await db.query.images.findFirst({
    where: (model, { eq }) => eq(model.id, imageId),
  });

  if (!image) throw new Error("Image not found");

  // Check if user has edit permission for this gallery
  const canEdit = await checkGalleryAccess(image.galleryId, user.userId);
  if (!canEdit)
    throw new Error(
      "Unauthorized - you don't have edit permission for this gallery",
    );

  await db.delete(images).where(eq(images.id, imageId));

  return true;
}

// This function is currently not used, so we're commenting it out
// It relies on exhibitions table which doesn't exist in the schema
/*
export async function incrementExhibitionViews(id: number) {
  try {
    await db
      .update(exhibitions)
      .set({
        viewCount: sql`${exhibitions.viewCount} + 1`,
      })
      .where(eq(exhibitions.id, id));

    return { success: true };
  } catch (error) {
    console.error("Failed to increment views:", error);
    return { success: false };
  }
}
*/
