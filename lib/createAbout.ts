import { prisma } from "@/lib/prisma";

async function createAbout() {
  try {
    // Check if about record exists
    const existing = await prisma.about.findFirst();

    if (existing) {
      console.log("✅ About record already exists:", existing);
      return;
    }

    // Create default about record
    const about = await prisma.about.create({
      data: {
        aboutText: "AM Clean Services - Your trusted cleaning partner in Cité El Khadhra, Tunisia. Professional cleaning services with eco-friendly products and guaranteed results.",
        email: "amcleanservices06@gmail.com",
        phone: "+216 50 770 176",
        address: "Cité El Khadhra, Tunisia",
        instagram: "https://instagram.com/amclean.services",
        facebook: "https://www.facebook.com/profile.php?id=61555985104044",
      },
    });

    console.log("✅ About record created successfully:", about);
  } catch (error) {
    console.error("❌ Error creating about record:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAbout();
