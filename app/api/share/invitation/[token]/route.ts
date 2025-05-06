import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import authOptions from "@/auth/authOptions";
import { shareFileInvitationSchema } from "@/lib/validators";

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token;

    const { success, error } = shareFileInvitationSchema.safeParse({ token });

    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    // Get the share invitation
    const share = await prisma.sharedItem.findUnique({
      where: {
        token,
      },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        sharedByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
    }

    // Check if the invitation has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
    }

    // Return information about the shared item
    const sharedItem = share.file || share.folder;
    const itemType = share.file ? "file" : "folder";

    return NextResponse.json({
      id: share.id,
      itemType,
      itemName: sharedItem?.name,
      sharedBy: share.sharedByUser.name || share.sharedByUser.email,
      permission: share.permission,
      expiresAt: share.expiresAt,
    });
  } catch (error) {
    console.error("Error fetching share invitation:", error);
    return NextResponse.json({ error: "Failed to fetch share invitation" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = params.token;

    const { success, error } = shareFileInvitationSchema.safeParse({ token });

    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    // Get the share invitation
    const share = await prisma.sharedItem.findUnique({
      where: {
        token,
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
    }

    // Check if the invitation has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
    }

    // Check if the invitation is for the current user
    if (share.sharedWithEmail !== session.user.email) {
      return NextResponse.json({ error: "This invitation is not for you" }, { status: 403 });
    }

    // Accept the invitation
    const updatedShare = await prisma.sharedItem.update({
      where: {
        id: share.id,
      },
      data: {
        created: true,
        token: null, // Clear the token once accepted
      },
    });

    return NextResponse.json({
      message: "Share invitation accepted",
      id: updatedShare.id,
    });
  } catch (error) {
    console.error("Error accepting share invitation:", error);
    return NextResponse.json({ error: "Failed to accept share invitation" }, { status: 500 });
  }
}
