import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/auth/authOptions";
import prisma from "@/lib/prisma";
import { Folder } from "@/generated/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user;

    const breadcrumbs: Folder[] = [];
    let currentFolderId = id;

    // Build breadcrumbs by walking up the folder tree
    while (currentFolderId) {
      const folder = (await prisma.folder.findUnique({
        where: {
          id: currentFolderId,
          userId: currentUser.id,
          isRoot: false,
        },
        select: {
          id: true,
          name: true,
          parentId: true,
          userId: true,
          isRoot: true,
        },
      })) as Folder;

      if (!folder) {
        break;
      }

      breadcrumbs.unshift(folder);
      if (!folder.parentId) {
        break;
      }

      currentFolderId = folder.parentId;
    }

    return NextResponse.json(breadcrumbs);
  } catch (error) {
    console.error("Error fetching breadcrumbs:", error);
    return NextResponse.json({ error: "Failed to fetch breadcrumbs" }, { status: 500 });
  }
}
