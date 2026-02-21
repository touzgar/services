import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabase, buildErrorResponse } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await withDatabase(async () => {
      return await prisma.user.findUnique({
        where: { username },
      });
    }, "POST /api/auth/login - Find user");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admin users can login" },
        { status: 403 }
      );
    }

    // Store user session
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "user_id",
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400 * 7, // 7 days
    });

    return response;
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Internal server error");
    console.error("[POST /api/auth/login]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
