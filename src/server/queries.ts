import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

// Gallery queries
export async function getImages(galleryId: number) {
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized you are unauthoirzed");

  // Check if the user has permission to access this gallery
  const hasAccess = await checkGalleryAccess(galleryId, user.userId);
  if (!hasAccess) throw new Error("Unauthorized");

  const userImages = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.galleryId, galleryId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return userImages;
}

export async function getImage(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const image = await db.query.images.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
  if (!image) throw new Error("Image not found");

  // Check if the user has access to the gallery this image belongs to
  const hasAccess = await checkGalleryAccess(image.galleryId, user.userId);
  if (!hasAccess) throw new Error("Unauthorized");

  return image;
}

export async function getGallery(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
  if (!gallery) throw new Error("Gallery not found");

  // Check if user is the owner
  const hasAccess = await checkGalleryAccess(gallery.id, user.userId);
  if (!hasAccess) throw new Error("Unauthorized");

  return gallery;
}

export async function getGalleries() {
  const user = await auth();
  if (!user.userId) return null;

  // Get galleries owned by the user
  return db.query.galleries.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });
}

export async function getGalleryName(galleryId: number) {
  const gallery = await getGallery(galleryId)
  return gallery.name
}

export async function getGalleryWithImages(galleryId: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check access first
  const hasAccess = await checkGalleryAccess(galleryId, user.userId);
  if (!hasAccess) throw new Error("Unauthorized");

  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId),
    with: {
      images: true
    },
  });

  return gallery;
}

// Helper function to check if a user has access to a gallery (owner-only)
export async function checkGalleryAccess(galleryId: number, userId: string) {
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId),
  });

  return gallery?.userId === userId;
}
