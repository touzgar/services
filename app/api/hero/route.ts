import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabase, buildErrorResponse } from "@/lib/db";

// Force dynamic rendering to prevent stale cached responses
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - Fetch hero section
export async function GET() {
  try {
    const hero = await withDatabase(async () => {
      let record = await prisma.heroSection.findFirst();

      // If no record exists, create default one
      if (!record) {
        record = await prisma.heroSection.create({
          data: {
            imageUrl: "",
            ctaText: "Commencer",
            ctaLink: "#contact",
          },
        });
      }

      return record;
    }, "GET /api/hero");

    const response = NextResponse.json(hero);
    // Prevent caching so fresh data is always returned
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    return response;
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to fetch hero section");
    const response = NextResponse.json({ error: message }, { status });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return response;
  }
}

// PUT - Update hero section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const hero = await withDatabase(async () => {
      let record = await prisma.heroSection.findFirst();

      if (!record) {
        record = await prisma.heroSection.create({
          data: {
            imageUrl: body.imageUrl || "",
            ctaText: body.ctaText || "Get Started",
            ctaLink: body.ctaLink || "#contact",
          },
        });
      } else {
        record = await prisma.heroSection.update({
          where: { id: record.id },
          data: {
            imageUrl: body.imageUrl !== undefined ? body.imageUrl : record.imageUrl,
            ctaText: body.ctaText !== undefined ? body.ctaText : record.ctaText,
            ctaLink: body.ctaLink !== undefined ? body.ctaLink : record.ctaLink,
          },
        });
      }

      return record;
    }, "PUT /api/hero");

    return NextResponse.json(hero);
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to update hero section");
    return NextResponse.json({ error: message }, { status });
  }
}
