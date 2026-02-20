import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const mediaType = formData.get("mediaType") as string;

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      console.error("Error creating uploads directory:", err);
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

    // Save to database
    const media = await prisma.media.create({
      data: {
        userId,
        title,
        description: description || "",
        type: mediaType,
        url: fileUrl,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
