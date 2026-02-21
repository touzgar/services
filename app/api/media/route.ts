import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabase, buildErrorResponse } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const media = await withDatabase(async () => {
      return await prisma.media.findMany({
        orderBy: { createdAt: "desc" },
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
    }, "GET /api/media");

    const arr = Array.isArray(media) ? media : [];

    const response = NextResponse.json(arr);
    // Prevent caching so fresh data is always returned
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    return response;
  } catch (error) {
    const response = NextResponse.json([], { status: 500 });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return response;
  }
}
