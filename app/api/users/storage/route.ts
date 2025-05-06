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

    const user = await prisma.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        usedStorage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      usedStorage: user.usedStorage,
    });
  } catch (error) {
    console.error("Error fetching user storage:", error);
    return NextResponse.json({ error: "Failed to fetch user storage" }, { status: 500 });
  }
}
