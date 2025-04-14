import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db } from "~/server/db";
import { galleries, images } from "~/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

// For debugging purposes
const logError = (message: string, data?: unknown) => {
  console.error(
    `UploadThing Error: ${message}`,
    data ? JSON.stringify(data) : "",
  );
};

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  galleryImageUploader: f({ image: { maxFileSize: "16MB", maxFileCount: 40 } })
    .input(z.object({ galleryId: z.number().positive() }))
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input, files: _files }) => {
      try {
        const { userId } = await auth();

        if (!userId) {
          logError("Authentication failed", { userId });
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw new UploadThingError("Authentication required");
        }

        // Validate gallery ID
        const galleryId = input.galleryId;
        if (!galleryId || galleryId <= 0) {
          logError("Invalid gallery ID", { galleryId });
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw new UploadThingError("Invalid gallery ID");
        }

        // Log successful middleware execution
        console.log("Middleware validated successfully", { userId, galleryId });

        return { userId, galleryId };
      } catch (error) {
        logError("Middleware error", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(images).values({
        name: file.name,
        url: file.url,
        userId: metadata.userId,
        galleryId: metadata.galleryId,
      });
      console.log("inserted!");

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

  galleryCoverUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(z.object({ galleryId: z.number().positive() }))
    .middleware(async ({ input, files: _files }) => {
      try {
        const { userId } = await auth();

        if (!userId) {
          logError("Authentication failed for cover photo", { userId });
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw new UploadThingError("Authentication required");
        }

        // Validate gallery ID
        const galleryId = input.galleryId;
        if (!galleryId || galleryId <= 0) {
          logError("Invalid gallery ID for cover photo", { galleryId });
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw new UploadThingError("Invalid gallery ID");
        }

        // Log successful middleware execution
        console.log("Cover photo middleware validated successfully", {
          userId,
          galleryId,
        });

        return { userId, galleryId };
      } catch (error) {
        logError("Cover photo middleware error", error);
        throw error;
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(galleries)
        .set({ coverPhotoUrl: file.url })
        .where(eq(galleries.id, metadata.galleryId));
      console.log("cover photo updated!");

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
