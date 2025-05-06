import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/auth/authOptions";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user;

    const share = await prisma.sharedItem.findUnique({
      where: {
        id,
      },
      include: {
        file: {
          select: {
            id: true,
            name: true,
            type: true,
            size: true,
            url: true,
            thumbnailUrl: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Check if the user has permission to view the share
    if (share.sharedByUserId !== currentUser.id && share.sharedWithEmail !== currentUser.email) {
      return NextResponse.json({ error: "You don't have permission to view this share" }, { status: 403 });
    }

    return NextResponse.json(share);
  } catch (error) {
    console.error("Error fetching share:", error);
    return NextResponse.json({ error: "Failed to fetch share" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = session.user;

    const { permission } = await request.json();

    if (!permission || !["view", "edit", "admin"].includes(permission)) {
      return NextResponse.json({ error: "Valid permission is required" }, { status: 400 });
    }

    const share = await prisma.sharedItem.findUnique({
      where: {
        id,
        sharedByUserId: currentUser.id,
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    const updatedShare = await prisma.sharedItem.update({
      where: {
        id,
      },
      data: {
        permission,
      },
    });

    return NextResponse.json(updatedShare);
  } catch (error) {
    console.error("Error updating share:", error);
    return NextResponse.json({ error: "Failed to update share" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user;

    const share = await prisma.sharedItem.findUnique({
      where: {
        id,
      },
    });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Either the person who shared or the person it's shared with can delete the share
    if (share.sharedByUserId !== currentUser.id && share.sharedWithEmail !== currentUser.email) {
      return NextResponse.json({ error: "You don't have permission to delete this share" }, { status: 403 });
    }

    await prisma.sharedItem.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Share deleted successfully" });
  } catch (error) {
    console.error("Error deleting share:", error);
    return NextResponse.json({ error: "Failed to delete share" }, { status: 500 });
  }
}
