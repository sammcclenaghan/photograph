"use server"

import { db } from "~/server/db";
import { galleries, images, galleryCollaborators } from "~/server/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, eq, or } from "drizzle-orm";
import { checkGalleryAccess, hasEditPermission } from "./queries";
import type { CollaboratorRole } from "./db/schema";

export async function createGallery(formData: FormData) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string || "";
  if (!name) throw new Error("Gallery name is required");

  const [gallery] = await db.insert(galleries).values({
    name,
    description,
    userId: user.userId,
  }).returning();

  return gallery;
}

export async function getImages(galleryId: number) {
  const user = await auth()
  if (!user.userId) throw new Error("Unauthorized")

  // Check if user has access to this gallery
  const hasAccess = await checkGalleryAccess(galleryId, user.userId);
  if (!hasAccess) throw new Error("Unauthorized");

  const galleryImages = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.galleryId, galleryId),
    orderBy: (model, { desc }) => desc(model.id),
  })

  return galleryImages
}

export async function deleteGallery(galleryId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Only the gallery owner can delete the gallery
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId)
  });

  if (!gallery || gallery.userId !== userId) {
    throw new Error("Unauthorized - only gallery owner can delete a gallery");
  }

  await db.delete(galleries)
    .where(eq(galleries.id, galleryId));
}

export async function updateGallery(galleryId: number, formData: FormData) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string || "";
  if (!name) throw new Error("Gallery name is required");

  // Check if user has edit permission
  const canEdit = await hasEditPermission(galleryId, user.userId);
  if (!canEdit) throw new Error("Unauthorized - you don't have edit permission for this gallery");

  const [updatedGallery] = await db.update(galleries)
    .set({ name, description })
    .where(eq(galleries.id, galleryId))
    .returning();

  return updatedGallery;
}

export async function updateGalleryCoverPhoto(galleryId: number, coverPhotoUrl: string) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if user has edit permission
  const canEdit = await hasEditPermission(galleryId, user.userId);
  if (!canEdit) throw new Error("Unauthorized - you don't have edit permission for this gallery");

  const [updatedGallery] = await db.update(galleries)
    .set({ coverPhotoUrl })
    .where(eq(galleries.id, galleryId))
    .returning();

  return updatedGallery;
}

export async function updateGalleryCoverColor(galleryId: number, coverColor: string) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if user has edit permission
  const canEdit = await hasEditPermission(galleryId, user.userId);
  if (!canEdit) throw new Error("Unauthorized - you don't have edit permission for this gallery");

  const [updatedGallery] = await db.update(galleries)
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
  const canEdit = await hasEditPermission(image.galleryId, user.userId);
  if (!canEdit) throw new Error("Unauthorized - you don't have edit permission for this gallery");

  await db.delete(images)
    .where(eq(images.id, imageId));

  return true;
}

// New functions for collaborator management

export async function inviteCollaborator(galleryId: number, email: string, role: CollaboratorRole = 'viewer') {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if the current user is the gallery owner or admin
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId)
  });

  if (!gallery) throw new Error("Gallery not found");
  
  const isOwner = gallery.userId === user.userId;
  let canManageCollaborators = isOwner;
  
  if (!isOwner) {
    // Check if user is an admin collaborator
    const collaborator = await db.query.galleryCollaborators.findFirst({
      where: (model, { and, eq }) => 
        and(eq(model.galleryId, galleryId), eq(model.userId, user.userId))
    });
    
    canManageCollaborators = collaborator?.role === 'admin';
  }
  
  if (!canManageCollaborators) {
    throw new Error("Unauthorized - only gallery owners and admins can invite collaborators");
  }
  
  // Try to find the user by email
  try {
    // Skip trying to find user by email (Clerk API issue)
    // Store the invitation with just the email
    await db.insert(galleryCollaborators).values({
      galleryId,
      userId: `pending-${email}`,
      role,
      invitedBy: user.userId,
      email,
    });
    
    return { success: true, pending: true, email };
    
    /* Commenting out the Clerk user lookup that's causing issues
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });
    
    const invitedUser = users[0];
    
    if (!invitedUser) {
      // User not found in the system
      // Store the invitation with just the email for now
      await db.insert(galleryCollaborators).values({
        galleryId,
        userId: `pending-${email}`,
        role,
        invitedBy: user.userId,
        email,
      });
      
      return { success: true, pending: true, email };
    }
    
    // Check if the user is already a collaborator
    const existingCollaborator = await db.query.galleryCollaborators.findFirst({
      where: (model, { and, eq }) => 
        and(eq(model.galleryId, galleryId), eq(model.userId, invitedUser.id))
    });
    
    if (existingCollaborator) {
      // Update the existing collaborator role if different
      if (existingCollaborator.role !== role) {
        await db.update(galleryCollaborators)
          .set({ role, updatedAt: new Date() })
          .where(and(
            eq(galleryCollaborators.galleryId, galleryId),
            eq(galleryCollaborators.userId, invitedUser.id)
          ));
      }
      return { success: true, updated: true, userId: invitedUser.id };
    }
    
    // Add the new collaborator
    await db.insert(galleryCollaborators).values({
      galleryId,
      userId: invitedUser.id,
      role,
      invitedBy: user.userId,
      email,
    });
    
    return { success: true, added: true, userId: invitedUser.id };
    */
  } catch (error) {
    console.error("Error inviting collaborator:", error);
    throw new Error("Failed to invite collaborator");
  }
}

export async function updateCollaboratorRole(galleryId: number, collaboratorId: string, newRole: CollaboratorRole) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if the current user is the gallery owner or admin
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId)
  });

  if (!gallery) throw new Error("Gallery not found");
  
  const isOwner = gallery.userId === user.userId;
  let canManageCollaborators = isOwner;
  
  if (!isOwner) {
    // Check if user is an admin collaborator
    const collaborator = await db.query.galleryCollaborators.findFirst({
      where: (model, { and, eq }) => 
        and(eq(model.galleryId, galleryId), eq(model.userId, user.userId))
    });
    
    canManageCollaborators = collaborator?.role === 'admin';
  }
  
  if (!canManageCollaborators) {
    throw new Error("Unauthorized - only gallery owners and admins can update collaborator roles");
  }
  
  // Update the collaborator's role
  await db.update(galleryCollaborators)
    .set({ role: newRole, updatedAt: new Date() })
    .where(and(
      eq(galleryCollaborators.galleryId, galleryId),
      eq(galleryCollaborators.userId, collaboratorId)
    ));
    
  return { success: true, updated: true };
}

export async function removeCollaborator(galleryId: number, collaboratorId: string) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  // Check if the current user is the gallery owner or admin
  const gallery = await db.query.galleries.findFirst({
    where: (model, { eq }) => eq(model.id, galleryId)
  });

  if (!gallery) throw new Error("Gallery not found");
  
  const isOwner = gallery.userId === user.userId;
  let canManageCollaborators = isOwner;
  
  // Users can remove themselves from collaborators
  const isSelfRemoval = collaboratorId === user.userId;
  
  if (!isOwner && !isSelfRemoval) {
    // Check if user is an admin collaborator
    const collaborator = await db.query.galleryCollaborators.findFirst({
      where: (model, { and, eq }) => 
        and(eq(model.galleryId, galleryId), eq(model.userId, user.userId))
    });
    
    canManageCollaborators = collaborator?.role === 'admin';
  }
  
  if (!canManageCollaborators && !isSelfRemoval) {
    throw new Error("Unauthorized - only gallery owners, admins, or the collaborator themselves can remove collaborators");
  }
  
  // Remove the collaborator
  await db.delete(galleryCollaborators)
    .where(and(
      eq(galleryCollaborators.galleryId, galleryId),
      eq(galleryCollaborators.userId, collaboratorId)
    ));
    
  return { success: true };
}
