import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch hero section
export async function GET() {
  try {
    let hero = await prisma.heroSection.findFirst();

    // If no record exists, create default one
    if (!hero) {
      hero = await prisma.heroSection.create({
        data: {
          title: "Professional Cleaning Services",
          subtitle: "Transform Your Space",
          description: "Experience pristine cleanliness with eco-friendly solutions",
          ctaText: "Get Started",
          ctaLink: "#contact",
        },
      });
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error("Error fetching hero:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero section" },
      { status: 500 }
    );
  }
}

// PUT - Update hero section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    let hero = await prisma.heroSection.findFirst();

    if (!hero) {
      hero = await prisma.heroSection.create({
        data: {
          title: body.title || "",
          subtitle: body.subtitle || "",
          description: body.description || "",
          ctaText: body.ctaText || "Get Started",
          ctaLink: body.ctaLink || "#contact",
        },
      });
    } else {
      hero = await prisma.heroSection.update({
        where: { id: hero.id },
        data: {
          title: body.title !== undefined ? body.title : hero.title,
          subtitle: body.subtitle !== undefined ? body.subtitle : hero.subtitle,
          description: body.description !== undefined ? body.description : hero.description,
          ctaText: body.ctaText !== undefined ? body.ctaText : hero.ctaText,
          ctaLink: body.ctaLink !== undefined ? body.ctaLink : hero.ctaLink,
        },
      });
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error("Error updating hero:", error);
    return NextResponse.json(
      { error: "Failed to update hero section" },
      { status: 500 }
    );
  }
}
