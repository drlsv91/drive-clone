import prisma from "@/lib/prisma";
import { registerUserSchema } from "@/lib/validators";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { success, error, data } = registerUserSchema.safeParse(body);
    if (!success) {
      return NextResponse.json(error.format(), { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await hash(data.password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    // Create root folder for the user
    await prisma.folder.create({
      data: {
        name: "Root",
        isRoot: true,
        userId: user.id,
      },
    });

    const { ...userWithoutPassword } = user;

    return NextResponse.json({ message: "User created successfully", user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
