import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getImages(galleryId: number) {
  const user = await auth();

  if (!user.userId) throw new Error("Unauthorized you are unauthoirzed");

  const userImages = await db.query.images.findMany({
    where: (model, { eq, and }) =>
      and(eq(model.userId, user.userId), eq(model.galleryId, galleryId)),
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

  if (image.userId !== user.userId) throw new Error("Unauthorized");

  return image;
}

export async function getGalleries() {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const galleries = await db.query.galleries.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });
  return galleries;
}

export async function getGalleryWithImages(galleryId: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId),
    with: {
      images: true
    },
  });

  return gallery;
}
