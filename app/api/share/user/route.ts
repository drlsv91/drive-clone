import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/auth/authOptions";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user;

    // Get all items shared with the current user
    const sharedWithMe = await prisma.sharedItem.findMany({
      where: {
        sharedWithEmail: currentUser.email,
        created: true, // Only accepted shares
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
            createdAt: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
        sharedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform the data for easier consumption by the frontend
    const transformedData = sharedWithMe.map((share) => {
      const item = share.file ?? share.folder;
      const itemType = share.file ? "file" : "folder";

      return {
        id: share.id,
        itemId: item?.id,
        itemType,
        itemName: item?.name,
        createdAt: item?.createdAt,
        sharedBy: {
          id: share.sharedByUser.id,
          name: share.sharedByUser.name ?? share.sharedByUser.email,
        },
        permission: share.permission,
        ...(share.file
          ? {
              type: share.file.type,
              size: share.file.size,
              url: share.file.url,
              thumbnailUrl: share.file.thumbnailUrl,
            }
          : {}),
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching shared items:", error);
    return NextResponse.json({ error: "Failed to fetch shared items" }, { status: 500 });
  }
}
