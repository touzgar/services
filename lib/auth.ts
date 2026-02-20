import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function verifyAdminCredentials(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== "admin") {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}
