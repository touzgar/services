import { prisma } from "@/lib/prisma";

async function createServices() {
  try {
    // Check if services already exist
    const existing = await prisma.service.findMany();

    if (existing.length > 0) {
      console.log("✅ Services already exist:", existing.length, "services");
      return;
    }

    // Create default services
    const services = await prisma.service.createMany({
      data: [
        {
          title: "Professional Team",
          description: "Our highly trained and experienced cleaning professionals deliver exceptional results every time.",
          icon: "👨‍💼",
          order: 0,
        },
        {
          title: "Eco-Friendly",
          description: "We use environmentally safe cleaning products that are effective and safe for your family.",
          icon: "🌿",
          order: 1,
        },
        {
          title: "Guaranteed Results",
          description: "We guarantee 100% satisfaction or your money back. Your cleanliness is our priority.",
          icon: "✅",
          order: 2,
        },
      ],
    });

    console.log("✅ Services created successfully:", services.count, "services");
  } catch (error) {
    console.error("❌ Error creating services:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createServices();
