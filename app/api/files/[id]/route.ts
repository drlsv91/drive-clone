import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/auth/authOptions";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { filePatchSchema } from "@/lib/validators";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = session.user;
    const file = await prisma.file.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Update last viewed time
    await prisma.file.update({
      where: { id },
      data: { viewedAt: new Date() },
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = session.user;

    const body = await request.json();
    const { success, error, data } = filePatchSchema.safeParse(body);

    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    // Get the file
    const file = await prisma.file.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Update the file
    const updatedFile = await prisma.file.update({
      where: {
        id,
      },
      data: { name: data.name, isStarred: data.isStarred },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
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

    // Get the file
    const file = await prisma.file.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Check for permanent delete flag
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // Permanently delete file from Cloudinary
      try {
        await deleteFromCloudinary(file.publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
      }

      // Delete from database
      await prisma.file.delete({
        where: {
          id,
        },
      });

      // Update user's used storage
      await prisma.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          usedStorage: {
            decrement: file.size,
          },
        },
      });

      return NextResponse.json({
        message: "File permanently deleted",
        permanent: true,
      });
    } else {
      // Move to trash
      await prisma.file.update({
        where: {
          id,
        },
        data: {
          isTrash: true,
        },
      });

      return NextResponse.json({
        message: "File moved to trash",
        permanent: false,
      });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = session.user;
    const body = await request.json();
    const { success, error } = filePatchSchema.safeParse(body);

    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    // Get the file
    const file = await prisma.file.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Handle specific operations
    const { operation } = body;

    if (operation === "star") {
      const updatedFile = await prisma.file.update({
        where: { id },
        data: { isStarred: true },
      });
      return NextResponse.json(updatedFile);
    }

    if (operation === "unstar") {
      const updatedFile = await prisma.file.update({
        where: { id },
        data: { isStarred: false },
      });
      return NextResponse.json(updatedFile);
    }

    if (operation === "restore") {
      const updatedFile = await prisma.file.update({
        where: { id },
        data: { isTrash: false },
      });
      return NextResponse.json(updatedFile);
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  }
}
