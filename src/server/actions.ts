"use server"

import { db } from "~/server/db";
import { galleries } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function createGallery(formData: FormData) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  if (!name) throw new Error("Gallery name is required");

  const coverPhotoUrl = formData.get("coverPhotoUrl") as string;
  if (!coverPhotoUrl) throw new Error("Cover photo is required");

  await db.insert(galleries).values({
    name,
    cover_photo_url: coverPhotoUrl,
    userId: user.userId,
  });
}
