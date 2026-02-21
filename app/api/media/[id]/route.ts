import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabase, buildErrorResponse } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invalid media ID" }, { status: 400 });
    }

    const media = await withDatabase(async () => {
      return await prisma.media.findUnique({
        where: { id },
      });
    }, "DELETE /api/media/[id] - Find media");

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete file from filesystem if it exists
    if (media.url) {
      try {
        const fileName = media.url.split("/").pop();
        if (fileName) {
          const filePath = path.join(process.cwd(), "public", "uploads", fileName);
          await fs.unlink(filePath);
        }
      } catch (fileError) {
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await withDatabase(async () => {
      return await prisma.media.delete({
        where: { id },
      });
    }, "DELETE /api/media/[id] - Delete media");

    return NextResponse.json({ success: true });
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to delete media");
    return NextResponse.json({ error: message }, { status });
  }
}
