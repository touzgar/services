import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabase, buildErrorResponse } from "@/lib/db";

// GET - Fetch all services
export async function GET() {
  try {
    const services = await withDatabase(async () => {
      return await prisma.service.findMany({
        orderBy: { order: "asc" },
      });
    }, "GET /api/services");

    return NextResponse.json(services);
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to fetch services");
    console.error("[GET /api/services]", message);
    return NextResponse.json({ error: message }, { status });
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const service = await withDatabase(async () => {
      // Get the highest order number
      const lastService = await prisma.service.findFirst({
        orderBy: { order: "desc" },
      });
      const newOrder = (lastService?.order ?? 0) + 1;

      return await prisma.service.create({
        data: {
          title: body.title || "New Service",
          description: body.description || "",
          icon: body.icon || "✨",
          order: newOrder,
        },
      });
    }, "POST /api/services");

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to create service");
    console.error("[POST /api/services]", message);
    return NextResponse.json({ error: message }, { status });
  }
}

// PUT - Update service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Service ID required" },
        { status: 400 }
      );
    }

    const service = await withDatabase(async () => {
      return await prisma.service.update({
        where: { id },
        data: {
          title: body.title !== undefined ? body.title : undefined,
          description: body.description !== undefined ? body.description : undefined,
          icon: body.icon !== undefined ? body.icon : undefined,
          order: body.order !== undefined ? body.order : undefined,
        },
      });
    }, "PUT /api/services");

    return NextResponse.json(service);
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to update service");
    console.error("[PUT /api/services]", message);
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE - Delete service
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Service ID required" },
        { status: 400 }
      );
    }

    await withDatabase(async () => {
      return await prisma.service.delete({
        where: { id },
      });
    }, "DELETE /api/services");

    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    const { message, status } = buildErrorResponse(error, "Failed to delete service");
    console.error("[DELETE /api/services]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
