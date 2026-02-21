import { PrismaClient } from "@prisma/client";

// Prevent multiple instances during hot-reload in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Production-safe Prisma singleton pattern
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    // Ensure Prisma engine does not automatically print connection drop errors
    log: [],
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
