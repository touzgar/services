import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabase, buildErrorResponse } from "@/lib/db";

// GET - Fetch about/contact information
export async function GET() {
  try {
    const about = await withDatabase(async () => {
      let record = await prisma.about.findFirst();

      // If no record exists, create default one
      if (!record) {
        record = await prisma.about.create({
          data: {
            aboutText: "",
            email: "",
            phone: "",
            address: "",
            instagram: "",
            facebook: "",
          },
        });
      }

      return record;
    }, "GET /api/about");

    return NextResponse.json(about);
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to fetch about information");
    console.error("[GET /api/about]", message);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT - Update about/contact information
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const about = await withDatabase(async () => {
      let record = await prisma.about.findFirst();

      if (!record) {
        // Create new record if doesn't exist
        record = await prisma.about.create({
          data: {
            aboutText: body.aboutText || "",
            email: body.email || "",
            phone: body.phone || "",
            address: body.address || "",
            instagram: body.instagram || "",
            facebook: body.facebook || "",
          },
        });
      } else {
        // Update existing record
        record = await prisma.about.update({
          where: { id: record.id },
          data: {
            aboutText: body.aboutText !== undefined ? body.aboutText : record.aboutText,
            email: body.email !== undefined ? body.email : record.email,
            phone: body.phone !== undefined ? body.phone : record.phone,
            address: body.address !== undefined ? body.address : record.address,
            instagram: body.instagram !== undefined ? body.instagram : record.instagram,
            facebook: body.facebook !== undefined ? body.facebook : record.facebook,
          },
        });
      }

      return record;
    }, "PUT /api/about");

    return NextResponse.json(about);
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to update about information");
    console.error("[PUT /api/about]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
