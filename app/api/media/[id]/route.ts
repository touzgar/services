import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const media = await prisma.media.findUnique({
      where: { id },
    });

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
        console.warn("Could not delete file:", fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
