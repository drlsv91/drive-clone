import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { v4 as uuidv4 } from "uuid";
import authOptions from "@/auth/authOptions";
import { patchShareFileSchema, shareFileSchema } from "@/lib/validators";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user;
    const body = await request.json();
    const { success, error } = shareFileSchema.safeParse(body);
    const { fileId, folderId, sharedWithEmail, permission } = body;

    // Validate input
    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    // Verify ownership of the file or folder
    if (fileId) {
      const file = await prisma.file.findUnique({
        where: { id: fileId, userId: currentUser.id },
      });

      if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
    }

    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId, userId: currentUser.id },
      });

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }

    // Check if user is trying to share with themselves
    if (sharedWithEmail === currentUser.email) {
      return NextResponse.json({ error: "You cannot share with yourself" }, { status: 400 });
    }

    // Check if already shared with this email
    const existingShare = await prisma.sharedItem.findFirst({
      where: {
        sharedByUserId: currentUser.id,
        sharedWithEmail,
        fileId,
        folderId,
      },
    });

    if (existingShare) {
      return NextResponse.json({ error: "Already shared with this email" }, { status: 409 });
    }

    // Generate a token for the invitation link
    const token = uuidv4();

    // Set expiry date for the invitation (e.g., 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create the share record
    const sharedItem = await prisma.sharedItem.create({
      data: {
        fileId,
        folderId,
        sharedByUserId: currentUser.id,
        sharedWithEmail,
        permission,
        token,
        expiresAt,
      },
    });

    // [TODO] send an email to the recipient
    // with a link to accept the share invitation

    return NextResponse.json({
      message: "Item shared successfully",
      shareId: sharedItem.id,
      token,
    });
  } catch (error) {
    console.error("Error sharing item:", error);
    return NextResponse.json({ error: "Failed to share item" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user;

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const folderId = searchParams.get("folderId");
    const { success, error } = patchShareFileSchema.safeParse({ fileId, folderId });

    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    await validateFileAndFolder(currentUser, fileId, folderId);

    // Get shares for the item
    const shares = await prisma.sharedItem.findMany({
      where: {
        fileId,
        folderId,
        sharedByUserId: currentUser.id,
      },
      select: {
        id: true,
        sharedWithEmail: true,
        permission: true,
        createdAt: true,
        created: true,
      },
    });

    return NextResponse.json(shares);
  } catch (error) {
    console.error("Error fetching shares:", error);
    return NextResponse.json({ error: "Failed to fetch shares" }, { status: 500 });
  }
}

async function validateFileAndFolder(
  currentUser: { id: string; email: string },
  fileId?: string | null,
  folderId?: string | null
) {
  // Verify ownership or access to shared item
  if (fileId) {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.userId !== currentUser.id) {
      // Check if shared with user
      const sharedWithUser = await prisma.sharedItem.findFirst({
        where: {
          fileId,
          sharedWithEmail: currentUser.email,
        },
      });

      if (!sharedWithUser) {
        return NextResponse.json({ error: "You don't have permission to access this file" }, { status: 403 });
      }
    }
  }

  if (folderId) {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    if (folder.userId !== currentUser.id) {
      // Check if shared with user
      const sharedWithUser = await prisma.sharedItem.findFirst({
        where: {
          folderId,
          sharedWithEmail: currentUser.email,
        },
      });

      if (!sharedWithUser) {
        return NextResponse.json({ error: "You don't have permission to access this folder" }, { status: 403 });
      }
    }
  }
}
