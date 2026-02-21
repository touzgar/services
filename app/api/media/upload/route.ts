import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabase, buildErrorResponse } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const mediaType = formData.get("mediaType") as string;
    const isBeforeAfter = formData.get("isBeforeAfter") === "true";
    const beforeImageUrl = formData.get("beforeImageUrl") as string | null;
    const afterImageUrl = formData.get("afterImageUrl") as string | null;

    if (!file || !title || !mediaType) {
      return NextResponse.json(
        { error: "File, title, and media type are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (mediaType === "image" && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please upload an image file" },
        { status: 400 }
      );
    }

    if (mediaType === "video" && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Please upload a video file" },
        { status: 400 }
      );
    }

    // Get user ID from cookie
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user exists in database before proceeding
    const userExists = await withDatabase(async () => {
      return await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    }, "POST /api/media/upload - Verify user");

    if (!userExists) {
      return NextResponse.json(
        { error: "User session invalid. Please log out and log in again." },
        { status: 401 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // ignore
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const ext = path.extname(file.name);
    const fileName = `${timestamp}-${randomStr}${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    // Save to database with retry logic
    const media = await withDatabase(async () => {
      return await prisma.media.create({
        data: {
          userId,
          title,
          description: description || "",
          type: mediaType,
          url: fileUrl,
          isBeforeAfter: isBeforeAfter,
          beforeImageUrl: beforeImageUrl || null,
          afterImageUrl: afterImageUrl || null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          url: true,
          isBeforeAfter: true,
          beforeImageUrl: true,
          afterImageUrl: true,
          createdAt: true,
        },
      });
    }, "POST /api/media/upload");

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to upload file");
    return NextResponse.json({ error: message }, { status });
  }
}
