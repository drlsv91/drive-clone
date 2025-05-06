import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/auth/authOptions";
import prisma from "@/lib/prisma";
import { createFolderSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = session.user;

    const { searchParams } = new URL(request.url);

    const parentId = searchParams.get("parentId") ?? null;
    const isTrash = searchParams.get("isTrash") === null ? undefined : searchParams.get("isTrash") === "true";

    const folders = await prisma.folder.findMany({
      where: {
        userId: currentUser.id,
        parentId: parentId,
        isTrash,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { success, error } = createFolderSchema.safeParse(body);
    const { name, parentId } = body;

    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    const existingFolder = await prisma.folder.findFirst({
      where: {
        name,
        parentId: parentId ?? null,
        userId: session.user.id,
      },
    });

    if (existingFolder) {
      return NextResponse.json({ error: "A folder with this name already exists" }, { status: 409 });
    }

    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId: session.user.id,
        },
      });

      if (!parentFolder) {
        return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId: parentId ?? null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
