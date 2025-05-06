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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    // Search files
    const files = await prisma.file.findMany({
      where: {
        userId: currentUser.id,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
    });

    // Search folders
    const folders = await prisma.folder.findMany({
      where: {
        userId: currentUser.id,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 10,
    });

    // Format results
    const results = [
      ...folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        type: "folder" as const,
        path: "/dashboard/" + folder.id,
      })),
      ...files.map((file) => ({
        id: file.id,
        name: file.name,
        type: "file" as const,
        fileType: file.type,
        path: file.folder ? `/dashboard/${file.folder.id}` : "/dashboard",
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}
