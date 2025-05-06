import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = session.user;

    // Begin a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get all files in the trash
      const trashedFiles = await tx.file.findMany({
        where: {
          userId: currentUser.id,
          isTrash: true,
        },
        select: {
          id: true,
          publicId: true,
          size: true,
        },
      });

      // 2. Delete files from Cloudinary
      for (const file of trashedFiles) {
        try {
          await deleteFromCloudinary(file.publicId);
        } catch (error) {
          console.error(`Error deleting file ${file.id} from Cloudinary:`, error);
        }
      }

      // 3. Calculate total size to be freed
      const totalSizeToFree = trashedFiles.reduce((sum, file) => sum + file.size, 0);

      // 4. Delete all files in trash
      await tx.file.deleteMany({
        where: {
          userId: currentUser.id,
          isTrash: true,
        },
      });

      // 5. Delete all folders in trash
      await tx.folder.deleteMany({
        where: {
          userId: currentUser.id,
          isTrash: true,
        },
      });

      // 6. Update user's storage usage
      if (totalSizeToFree > 0) {
        await tx.user.update({
          where: {
            id: currentUser.id,
          },
          data: {
            usedStorage: {
              decrement: totalSizeToFree,
            },
          },
        });
      }

      return {
        deletedFilesCount: trashedFiles.length,
        freedStorage: totalSizeToFree,
      };
    });

    return NextResponse.json({
      message: "Trash emptied successfully",
      deletedFiles: result.deletedFilesCount,
      freedStorage: result.freedStorage,
    });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json({ error: "Failed to empty trash" }, { status: 500 });
  }
}
