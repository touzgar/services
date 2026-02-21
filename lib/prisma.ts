import { PrismaClient } from "@prisma/client";

// Prevent multiple instances during hot-reload in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Production-safe Prisma singleton pattern
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    // Logging configuration - minimal in production
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["error", "warn"],
    errorFormat: "pretty",
  });
};

// Reuse client if already instantiated (prevents connection leaks on hot-reload)
export const prisma =
  globalThis.prisma ??
  createPrismaClient();

// Ensure singleton pattern in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
