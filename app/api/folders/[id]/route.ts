import authOptions from "@/auth/authOptions";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { fileFilterSchema, patchFolderSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = session.user;

    const folder = await prisma.folder.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
      include: {
        children: true,
        files: true,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json({ error: "Failed to fetch folder" }, { status: 500 });
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
    const { name, parentId, isStarred } = body;

    const { success, error } = patchFolderSchema.safeParse(body);

    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    const folder = await prisma.folder.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Prevent updating root folder's parent
    if (folder.isRoot && parentId !== undefined) {
      return NextResponse.json({ error: "Cannot move root folder" }, { status: 403 });
    }

    // Check if the parent folder exists and belongs to the user
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: {
          id: parentId,
          userId: currentUser.id,
        },
      });

      if (!parentFolder) {
        return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
      }

      // Prevent circular reference (folder can't be its own parent)
      if (parentId === id) {
        return NextResponse.json({ error: "Folder cannot be its own parent" }, { status: 400 });
      }
    }

    const updatedFolder = await prisma.folder.update({
      where: {
        id,
      },
      data: { name, isStarred, parentId },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
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
    const folder = await prisma.folder.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
      include: {
        files: true,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Prevent deleting root folder
    if (folder.isRoot) {
      return NextResponse.json({ error: "Cannot delete root folder" }, { status: 403 });
    }

    // Check for permanent delete flag
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      // For permanent deletion, first get all files in this folder and subfolders
      const allFolderIds = await getSubFolderIds(id);
      allFolderIds.push(id); // Include the current folder

      // Get all files in these folders
      const files = await prisma.file.findMany({
        where: {
          folderId: {
            in: allFolderIds,
          },
        },
      });

      // Delete files from Cloudinary
      for (const file of files) {
        try {
          await deleteFromCloudinary(file.publicId);
        } catch (cloudinaryError) {
          console.error(`Error deleting file ${file.id} from Cloudinary:`, cloudinaryError);
        }
      }

      // Calculate total size of all files to update user storage
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      // Delete the folder and all its contents (Prisma cascade will handle this)
      await prisma.folder.delete({
        where: {
          id,
        },
      });

      // Update user's used storage
      if (totalSize > 0) {
        await prisma.user.update({
          where: {
            id: currentUser.id,
          },
          data: {
            usedStorage: {
              decrement: totalSize,
            },
          },
        });
      }

      return NextResponse.json({
        message: "Folder and all contents permanently deleted",
        permanent: true,
      });
    } else {
      // Move to trash
      await prisma.folder.update({
        where: {
          id,
        },
        data: {
          isTrash: true,
        },
      });

      return NextResponse.json({
        message: "Folder moved to trash",
        permanent: false,
      });
    }
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
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

    const { success, error } = fileFilterSchema.safeParse(body);

    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    // Get the folder
    const folder = await prisma.folder.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    // Handle specific operations
    const { operation } = body;

    if (operation === "star") {
      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { isStarred: true },
      });
      return NextResponse.json(updatedFolder);
    }

    if (operation === "unstar") {
      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { isStarred: false },
      });
      return NextResponse.json(updatedFolder);
    }

    if (operation === "restore") {
      const updatedFolder = await prisma.folder.update({
        where: { id },
        data: { isTrash: false },
      });
      return NextResponse.json(updatedFolder);
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}

async function getSubFolderIds(folderId: string): Promise<string[]> {
  const subfolders = await prisma.folder.findMany({
    where: {
      parentId: folderId,
    },
    select: {
      id: true,
    },
  });

  const subfolderIds = subfolders.map((folder) => folder.id);

  // Recursively get subfolders of subfolders
  for (const id of subfolderIds) {
    const childIds = await getSubFolderIds(id);
    subfolderIds.push(...childIds);
  }

  return subfolderIds;
}
