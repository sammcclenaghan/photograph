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
