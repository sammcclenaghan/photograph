import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "~/server/db";
import { images } from "~/server/db/schema";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  galleryImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 40 } })
    .input(z.object({ galleryId: z.number() }))
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      const { userId } = await auth();
      console.log('middleware touched')

      // eslint-disable-next-line @typescript-eslint/only-throw-error
      if (!userId) throw new UploadThingError("Unauthorized");

      return { userId, galleryId: input.galleryId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(images).values({
        name: file.name,
        url: file.url,
        userId: metadata.userId,
        galleryId: metadata.galleryId,
      });
      console.log("inserted!")

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
