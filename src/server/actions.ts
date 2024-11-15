"use server"

import { db } from "~/server/db";
import { galleries } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGallery(formData: FormData) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string || ""; // Add description handling
  if (!name) throw new Error("Gallery name is required");

  await db.insert(galleries).values({
    name,
    description,
    userId: user.userId,
  }).returning();

  revalidatePath("/");
  redirect("/")
}
