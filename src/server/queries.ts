import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { eq, or, and } from "drizzle-orm";
import { galleryCollaborators } from "./db/schema";

// Exhibition queries
export async function getExhibitionsByGallery(galleryId: number) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user has access to this gallery
  const hasAccess = await checkGalleryAccess(galleryId, userId);
  if (!hasAccess) {
    throw new Error("Unauthorized");
  }

  const exhibitionsList = await db.query.exhibitions.findMany({
    where: eq(exhibitions.galleryId, galleryId),
    orderBy: [desc(exhibitions.updatedAt)],
    with: {
      gallery: true,
    }
  });

  return exhibitionsList;
}

export async function getExhibitionById(id: number, includePositions = false) {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const exhibition = await db.query.exhibitions.findFirst({
    where: eq(exhibitions.id, id),
    with: {
      gallery: true,
      ...(includePositions && { imagePositions: { with: { image: true } } }),
    }
  });

  if (!exhibition) {
    throw new Error("Exhibition not found");
  }

  // Check if the user has access to the gallery this exhibition belongs to
  const hasAccess = await checkGalleryAccess(exhibition.galleryId, userId);
  // Allow public access if the exhibition is published
  if (!hasAccess && exhibition.isPublished !== 1) {
    throw new Error("Unauthorized");
  }

  return exhibition;
}

export async function getPublicExhibition(id: number) {
  const exhibition = await db.query.exhibitions.findFirst({
    where: and(
      eq(exhibitions.id, id),
      eq(exhibitions.isPublished, 1)
    ),
    with: {
      gallery: true,
      imagePositions: {
        with: {
          image: true
        },
        orderBy: asc(exhibitionImagePositions.sortOrder)
      }
    }
  });

  if (!exhibition) {
    throw new Error("Exhibition not found or not published");
  }

  return exhibition;
}

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

  // Check if user is owner or collaborator
  const hasAccess = await checkGalleryAccess(gallery.id, user.userId);
  if (!hasAccess) throw new Error("Unauthorized");

  return gallery;
}

export async function getGalleries() {
  const user = await auth();
  if (!user.userId) return null;

  // Get galleries owned by the user
  const ownedGalleries = await db.query.galleries.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });
  
  // Get galleries shared with the user
  const collaborativeGalleries = await db.query.galleryCollaborators.findMany({
    where: (model, { eq }) => eq(model.userId, user.userId),
    with: {
      gallery: true
    }
  });

  // Combine and deduplicate the galleries
  const sharedGalleries = collaborativeGalleries.map(collab => collab.gallery);
  
  return [...ownedGalleries, ...sharedGalleries];
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

// Helper function to check if a user has access to a gallery
export async function checkGalleryAccess(galleryId: number, userId: string) {
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId),
  });
  
  if (!gallery) return false;

  // If the user is the owner, they have access
  if (gallery.userId === userId) return true;
  
  // Check if the user is a collaborator
  const collaborator = await db.query.galleryCollaborators.findFirst({
    where: (model, { and, eq }) => 
      and(eq(model.galleryId, galleryId), eq(model.userId, userId))
  });
  
  return !!collaborator;
}

// Get collaborator's role (null if not a collaborator)
export async function getCollaboratorRole(galleryId: number, userId: string) {
  const collaborator = await db.query.galleryCollaborators.findFirst({
    where: (model, { and, eq }) => 
      and(eq(model.galleryId, galleryId), eq(model.userId, userId))
  });
  
  return collaborator?.role || null;
}

// Get a list of collaborators for a gallery
export async function getGalleryCollaborators(galleryId: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if the requesting user has access to the gallery
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId)
  });
  
  if (!gallery) throw new Error("Gallery not found");
  
  // Only the owner and admin-level collaborators should be able to see the full list of collaborators
  const isOwner = gallery.userId === user.userId;
  if (!isOwner) {
    const role = await getCollaboratorRole(galleryId, user.userId);
    if (role !== 'admin') throw new Error("Unauthorized");
  }

  // Fetch all collaborators
  const collaborators = await db.query.galleryCollaborators.findMany({
    where: (model, { eq }) => eq(model.galleryId, galleryId)
  });

  return collaborators;
}

// Check if the user has edit permissions for a gallery
export async function hasEditPermission(galleryId: number, userId: string) {
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId)
  });
  
  if (!gallery) return false;
  
  // Owner always has edit permission
  if (gallery.userId === userId) return true;
  
  // Check collaborator role
  const collaborator = await db.query.galleryCollaborators.findFirst({
    where: (model, { and, eq }) => 
      and(eq(model.galleryId, galleryId), eq(model.userId, userId))
  });
  
  // Editors and admins can edit
  return collaborator?.role === 'editor' || collaborator?.role === 'admin';
}
