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

    // If user is the owner of the gallery
    if (gallery.userId === user.userId) {
      return NextResponse.json({ role: "owner" });
    }

    // Check if user is a collaborator
    const collaborator = await db.query.galleryCollaborators.findFirst({
      where: (model, { and, eq }) => 
        and(eq(model.galleryId, galleryId), eq(model.userId, user.userId))
    });

    if (!collaborator) {
      return new NextResponse("Not a collaborator", { status: 403 });
    }

    return NextResponse.json({ role: collaborator.role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}