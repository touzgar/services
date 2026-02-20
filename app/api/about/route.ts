import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch about/contact information
export async function GET() {
  try {
    let about = await prisma.about.findFirst();

    // If no record exists, create default one
    if (!about) {
      about = await prisma.about.create({
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

    return NextResponse.json(about);
  } catch (error) {
    console.error("Error fetching about:", error);
    return NextResponse.json(
      { error: "Failed to fetch about information" },
      { status: 500 }
    );
  }
}

// PUT - Update about/contact information
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    let about = await prisma.about.findFirst();

    if (!about) {
      // Create new record if doesn't exist
      about = await prisma.about.create({
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
      about = await prisma.about.update({
        where: { id: about.id },
        data: {
          aboutText: body.aboutText !== undefined ? body.aboutText : about.aboutText,
          email: body.email !== undefined ? body.email : about.email,
          phone: body.phone !== undefined ? body.phone : about.phone,
          address: body.address !== undefined ? body.address : about.address,
          instagram: body.instagram !== undefined ? body.instagram : about.instagram,
          facebook: body.facebook !== undefined ? body.facebook : about.facebook,
        },
      });
    }

    return NextResponse.json(about);
  } catch (error) {
    console.error("Error updating about:", error);
    return NextResponse.json(
      { error: "Failed to update about information" },
      { status: 500 }
    );
  }
}
