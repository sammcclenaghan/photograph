import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { galleryCollaborators } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await auth();
    if (!user.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Extract the gallery ID and email from the request body
    const { galleryId, email } = await req.json();
    
    // Get user email from the request or session claims
    const userEmail = email || user.sessionClaims?.email as string;
    
    if (!userEmail) {
      console.error("User email not found in both request body and session claims");
      return new NextResponse("User email not found", { status: 400 });
    }
    
    if (!galleryId || isNaN(Number(galleryId))) {
      return new NextResponse("Invalid gallery ID", { status: 400 });
    }
    
    console.log(`Accepting invitation for email: ${userEmail}, galleryId: ${galleryId}`);

    // Find the pending invitation
    const pendingInvitation = await db.query.galleryCollaborators.findFirst({
      where: (model, { and, eq }) => 
        and(
          eq(model.galleryId, Number(galleryId)),
          eq(model.email, userEmail),
          eq(model.userId, `pending-${userEmail}`)
        )
    });

    if (!pendingInvitation) {
      console.error("Invitation not found");
      return new NextResponse("Invitation not found", { status: 404 });
    }

    // Update the invitation to assign it to the current user
    await db.update(galleryCollaborators)
      .set({
        userId: user.userId, // Change from pending-email to actual user ID
        updatedAt: new Date()
      })
      .where(
        and(
          eq(galleryCollaborators.galleryId, Number(galleryId)),
          eq(galleryCollaborators.userId, `pending-${userEmail}`)
        )
      );

    return NextResponse.json({ success: true, message: "Invitation accepted" });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}