import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Script to create an admin user
 * Run with: npx ts-node lib/createAdmin.ts
 * 
 * Usage:
 * 1. This script creates the default admin user
 * 2. Run the script
 * 3. User will be created in database
 */
async function createAdmin() {
  const username = "admin";
  const password = "admin123";

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      console.log("✅ Admin user already exists!");
      console.log(`Username: ${username}`);
      console.log(`Password: ${password}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "admin",
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log("\n🔒 Keep these credentials secure!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
