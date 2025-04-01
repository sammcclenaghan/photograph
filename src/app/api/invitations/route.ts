import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { galleryCollaborators, galleries } from "~/server/db/schema";
import { and, eq, or, like } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const user = await auth();
    if (!user.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user email from query parameter (sent by client)
    const url = new URL(request.url);
    const emailParam = url.searchParams.get('email');
    
    // Use email from query parameter if available
    const userEmail = emailParam || user.sessionClaims?.email as string;
    
    if (!userEmail) {
      console.error("User email not found in both query parameter and session claims");
      return new NextResponse("User email not found", { status: 400 });
    }
    
    console.log("Looking for invitations for email:", userEmail);

    // Find pending invitations for the user's email
    const pendingInvitations = await db.query.galleryCollaborators.findMany({
      where: (model, { eq }) => 
        and(
          eq(model.email, userEmail),
          eq(model.userId, `pending-${userEmail}`)
        ),
      with: {
        gallery: true
      }
    });
    
    console.log("Found pending invitations:", pendingInvitations.length);

    // Transform the response to include gallery details
    const invitationsWithDetails = pendingInvitations.map(invitation => ({
      id: `${invitation.galleryId}:${invitation.userId}`,
      galleryId: invitation.galleryId,
      galleryName: invitation.gallery?.name || 'Unknown Gallery',
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.invitedAt
    }));

    return NextResponse.json(invitationsWithDetails);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}