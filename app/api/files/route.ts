import authOptions from "@/app/auth/authOptions";
import { generateThumbnail, uploadToCloudinary } from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { fileFilterSchema } from "@/lib/validators";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId") ?? null;

    const { success, error } = fileFilterSchema.safeParse({ folderId });
    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    const files = await prisma.file.findMany({
      where: {
        userId: session.user.id,
        folderId: folderId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = (formData.get("folderId") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Check if file size is within limits (10MB for this example)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    // If folderId is provided, check if it exists and belongs to the user
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
        },
      });

      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }

    // Check user storage limit (100MB for this example)
    const STORAGE_LIMIT = 100 * 1024 * 1024; // 100MB
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        usedStorage: true,
      },
    });

    if ((user?.usedStorage ?? 0) + file.size > STORAGE_LIMIT) {
      return NextResponse.json({ error: "Storage limit exceeded" }, { status: 400 });
    }

    // Read file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      buffer,
      `${session.user.id}-${Date.now()}-${file.name}`,
      "drive-clone"
    );

    // Generate thumbnail if applicable
    const thumbnailUrl =
      file.type.startsWith("image/") || file.type === "application/pdf"
        ? await generateThumbnail(uploadResult.public_id)
        : null;

    // Save file metadata to database
    const newFile = await prisma.file.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        thumbnailUrl,
        folderId,
        userId: session.user.id,
      },
    });

    // Update user's used storage
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        usedStorage: {
          increment: file.size,
        },
      },
    });

    return NextResponse.json(newFile);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
