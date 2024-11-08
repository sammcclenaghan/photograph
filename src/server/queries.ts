import { auth } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getImages() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const images = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.userId, userId),
    orderBy: (model, { desc }) => desc(model.id),
  });

  return images
}


export async function getImage(id: number) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const image = await db.query.images.findFirst({
    where: (model, { eq }) => eq(model.id, id),
  });
  if (!image) throw new Error("image not found")

  if (image.userId !== userId) throw new Error("Unauthorized")

  return image
}
