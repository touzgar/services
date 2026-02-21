/**
 * Database Connection & Error Handling Utilities
 * Provides production-safe database operations with proper error handling
 */

import { prisma } from "./prisma";
import type { PrismaClientRustPanicError } from "@prisma/client/runtime/library";

/**
 * Generic database operation wrapper with error handling
 * Automatically retries on connection errors with exponential backoff
 */
export async function withDatabase<T>(
  operation: () => Promise<T>,
  operationName: string = "Database operation",
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a connection error
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("P1002") || // Cannot find requested database
          error.message.includes("P1001") || // Cannot reach database
          error.message.includes("closed") || // Connection closed
          error.message.includes("ECONNREFUSED") || // Connection refused
          error.message.includes("timeout")); // Connection timeout

      if (!isConnectionError || attempt === maxRetries) {
        console.error(
          `[${operationName}] Error on attempt ${attempt}/${maxRetries}:`,
          error instanceof Error ? error.message : error
        );
        break;
      }

      // Exponential backoff: 100ms, 200ms, 400ms
      const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
      console.warn(
        `[${operationName}] Attempt ${attempt} failed, retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`${operationName} failed after ${maxRetries} attempts`);
}

/**
 * Test database connection
 * Use this to verify Prisma client connectivity
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[Database] Connection test passed ✓");
    return true;
  } catch (error) {
    console.error(
      "[Database] Connection test failed:",
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

/**
 * Gracefully disconnect from database
 * Should be called during app shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("[Database] Disconnected gracefully ✓");
  } catch (error) {
    console.error(
      "[Database] Error disconnecting:",
      error instanceof Error ? error.message : error
    );
  }
}

/**
 * Type-safe error response builder for API routes
 */
export function buildErrorResponse(
  error: unknown,
  defaultMessage: string = "Database operation failed"
) {
  if (error instanceof Error) {
    // Prisma-specific error codes
    if (error.message.includes("P2025")) {
      return { message: "Record not found", status: 404 };
    }
    if (error.message.includes("P2002")) {
      return { message: "Unique constraint violation", status: 409 };
    }
    if (error.message.includes("P1002") || error.message.includes("closed")) {
      return { message: "Database connection lost", status: 503 };
    }
    return { message: error.message, status: 500 };
  }
  return { message: defaultMessage, status: 500 };
}

/**
 * Type guard for connection errors
 */
export function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("P1001") || // Cannot reach database
      error.message.includes("P1002") || // Cannot find database
      error.message.includes("closed") || // Connection closed
      error.message.includes("ECONNREFUSED") || // Connection refused
      error.message.includes("timeout") // Timeout
    );
  }
  return false;
}
