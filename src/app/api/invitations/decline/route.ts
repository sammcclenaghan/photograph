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
    
    // Get user email from request or session claims
    const userEmail = email || user.sessionClaims?.email as string;
    
    if (!userEmail) {
      console.error("User email not found in both request body and session claims");
      return new NextResponse("User email not found", { status: 400 });
    }

    if (!galleryId || isNaN(Number(galleryId))) {
      return new NextResponse("Invalid gallery ID", { status: 400 });
    }
    
    console.log(`Declining invitation for email: ${userEmail}, galleryId: ${galleryId}`);

    // Find and delete the pending invitation
    await db.delete(galleryCollaborators)
      .where(
        and(
          eq(galleryCollaborators.galleryId, Number(galleryId)),
          eq(galleryCollaborators.email, userEmail),
          eq(galleryCollaborators.userId, `pending-${userEmail}`)
        )
      );

    return NextResponse.json({ success: true, message: "Invitation declined" });
  } catch (error) {
    console.error("Error declining invitation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}