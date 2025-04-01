import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { galleryCollaborators, galleries } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { galleryId: string } }
) {
  try {
    const user = await auth();
    if (!user.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const galleryId = parseInt(params.galleryId);
    if (isNaN(galleryId)) {
      return new NextResponse("Invalid gallery ID", { status: 400 });
    }

    // First check if the gallery exists
    const gallery = await db.query.galleries.findFirst({
      where: (model, { eq }) => eq(model.id, galleryId)
    });

    if (!gallery) {
      return new NextResponse("Gallery not found", { status: 404 });
    }

    // Check if current user is the owner or an admin collaborator
    const isOwner = gallery.userId === user.userId;
    let canViewCollaborators = isOwner;
    
    if (!isOwner) {
      const userCollaborator = await db.query.galleryCollaborators.findFirst({
        where: (model, { and, eq }) => 
          and(eq(model.galleryId, galleryId), eq(model.userId, user.userId))
      });
      
      if (!userCollaborator) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
      
      // Only admin collaborators and the owner can see the collaborators list
      canViewCollaborators = userCollaborator.role === 'admin';
    }
    
    if (!canViewCollaborators) {
      return new NextResponse("Unauthorized - only gallery owners and admins can view collaborators", { status: 403 });
    }

    // Fetch all collaborators for the gallery
    const collaborators = await db.query.galleryCollaborators.findMany({
      where: (model, { eq }) => eq(model.galleryId, galleryId)
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}