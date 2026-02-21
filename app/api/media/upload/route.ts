import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabase, buildErrorResponse } from "@/lib/db";
import { UTApi } from "uploadthing/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileUrl = formData.get("fileUrl") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const mediaType = formData.get("mediaType") as string;
    const isBeforeAfter = formData.get("isBeforeAfter") === "true";
    const beforeImageUrl = formData.get("beforeImageUrl") as string | null;
    const afterImageUrl = formData.get("afterImageUrl") as string | null;

    if (!fileUrl || !title || !mediaType) {
      return NextResponse.json(
        { error: "File URL, title, and media type are required" },
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
