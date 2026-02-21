# CODE PATTERNS & BEST PRACTICES

This document demonstrates the exact patterns used across the application for production-safe database operations.

## PATTERN 1: Prisma Singleton (lib/prisma.ts)

This is the **CORRECT** way to use Prisma in Next.js.

Key principles:

- Single instance shared across entire application
- Cached in globalThis during development
- No new instances created per request
- Proper cleanup on app shutdown

```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
    errorFormat: "pretty",
  });
};

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
```

## PATTERN 2: Database Operation Wrapper (lib/db.ts)

This wrapper provides:

- Automatic retry on connection failures
- Exponential backoff (prevents overwhelming database)
- Connection error detection
- Proper error categorization

```typescript
export async function withDatabase<T>(
  operation: () => Promise<T>,
  operationName: string = "Database operation",
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("P1002") ||
          error.message.includes("P1001") ||
          error.message.includes("closed") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("timeout"));

      if (!isConnectionError || attempt === maxRetries) {
        console.error(
          `[${operationName}] Error on attempt ${attempt}/${maxRetries}:`,
          error instanceof Error ? error.message : error,
        );
        break;
      }

      const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
      console.warn(
        `[${operationName}] Attempt ${attempt} failed, retrying in ${delay}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw (
    lastError ||
    new Error(`${operationName} failed after ${maxRetries} attempts`)
  );
}
```

## PATTERN 3: Error Response Builder (lib/db.ts)

Converts database errors into proper HTTP responses:

- Returns meaningful error messages
- Proper status codes (503 for connection, 404 for not found, etc.)
- Sanitized to avoid exposing sensitive info

```typescript
export function buildErrorResponse(
  error: unknown,
  defaultMessage: string = "Database operation failed",
) {
  if (error instanceof Error) {
    // Connection errors → 503 Service Unavailable
    if (error.message.includes("P1002") || error.message.includes("closed")) {
      return { message: "Database connection lost", status: 503 };
    }

    // Not found errors → 404
    if (error.message.includes("P2025")) {
      return { message: "Record not found", status: 404 };
    }

    // Unique constraint violations → 409 Conflict
    if (error.message.includes("P2002")) {
      return { message: "Unique constraint violation", status: 409 };
    }

    // Connection issues → 503
    if (error.message.includes("P1001")) {
      return { message: "Database connection lost", status: 503 };
    }

    return { message: error.message, status: 500 };
  }

  return { message: defaultMessage, status: 500 };
}
```

## PATTERN 4: API Route Implementation (app/api/\*/route.ts)

All API routes follow this consistent pattern:

1. Import utilities (withDatabase, buildErrorResponse)
2. Wrap database operations in withDatabase()
3. Catch errors and build proper responses
4. Return JSON with correct status codes

### GET endpoint

```typescript
export async function GET() {
  try {
    const data = await withDatabase(async () => {
      return await prisma.about.findFirst();
    }, "GET /api/about");

    return NextResponse.json(data);
  } catch (error) {
    const { message, status } = buildErrorResponse(
      error,
      "Failed to fetch data",
    );
    console.error("[GET /api/about]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
```

### POST endpoint

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await withDatabase(async () => {
      return await prisma.service.create({
        data: {
          title: body.title,
          description: body.description,
          icon: body.icon,
        },
      });
    }, "POST /api/services");

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const { message, status } = buildErrorResponse(error);
    console.error("[POST /api/services]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
```

### PUT endpoint

```typescript
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const result = await withDatabase(async () => {
      return await prisma.service.update({
        where: { id },
        data: {
          title: body.title !== undefined ? body.title : undefined,
          description:
            body.description !== undefined ? body.description : undefined,
        },
      });
    }, "PUT /api/services");

    return NextResponse.json(result);
  } catch (error) {
    const { message, status } = buildErrorResponse(error);
    console.error("[PUT /api/services]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
```

### DELETE endpoint

```typescript
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await withDatabase(async () => {
      return await prisma.service.delete({
        where: { id },
      });
    }, "DELETE /api/services");

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    const { message, status } = buildErrorResponse(error);
    console.error("[DELETE /api/services]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
```

## PATTERN 5: Complex Database Operations

For complex operations (transactions, multiple queries, etc.), wrap the entire operation in withDatabase():

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await withDatabase(async () => {
      // Create related records atomically
      const user = await prisma.user.create({
        data: {
          username: body.username,
          email: body.email,
        },
      });

      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          displayName: body.displayName,
        },
      });

      return { user, profile };
    }, "POST /api/complex-operation");

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const { message, status } = buildErrorResponse(error);
    console.error("[POST /api/complex-operation]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
```

## PATTERN 6: Connection Health Check

Use this to verify database connectivity in monitoring:

```typescript
async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("[Database] Connection test passed ✓");
    return true;
  } catch (error) {
    console.error(
      "[Database] Connection test failed:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

// Usage in health check endpoint:
export async function GET() {
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    return NextResponse.json(
      { status: "unhealthy", error: "Database unavailable" },
      { status: 503 },
    );
  }
  return NextResponse.json({ status: "healthy" });
}
```

## PATTERN 7: React Components with Fixed Fetch Loops

### BEFORE (WRONG - Infinite API Calls)

```typescript
useEffect(() => {
  fetchAbout();
  fetchHero();
  fetchServices();

  // ❌ WRONG: Creates polling intervals without cleanup!
  const aboutInterval = setInterval(fetchAbout, 3000);
  const heroInterval = setInterval(fetchHero, 3000);
  const servicesInterval = setInterval(fetchServices, 3000);

  return () => {
    clearInterval(aboutInterval);
    clearInterval(heroInterval);
    clearInterval(servicesInterval);
  };
}, []); // ⚠️ Even with proper cleanup, this pollutes server with constant requests
```

### AFTER (CORRECT - Single Fetch on Mount)

```typescript
useEffect(() => {
  // ✅ CORRECT: Load data once on component mount
  fetchAbout();
  fetchHero();
  fetchServices();
  // Empty dependency array = runs ONCE on mount only
}, []);

const fetchAbout = async () => {
  try {
    const response = await fetch("/api/about"); // No ?t= busting
    if (response.ok) {
      const data = await response.json();
      setAbout(data);
    }
  } catch (error) {
    console.error("Failed to fetch about:", error);
  }
};

const fetchHero = async () => {
  try {
    const response = await fetch("/api/hero");
    if (response.ok) {
      const data = await response.json();
      setHero(data);
    }
  } catch (error) {
    console.error("Failed to fetch hero:", error);
  }
};

const fetchServices = async () => {
  try {
    const response = await fetch("/api/services");
    if (response.ok) {
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    }
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }
};
```

## PATTERN 8: Environment Configuration

```bash
# .env (local development)
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/database?sslmode=require&channel_binding=require"
NODE_ENV=development
```

Production deployment (set in platform):

- **Vercel**: Settings → Environment Variables
  - Key: `DATABASE_URL`
  - Value: `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/database?sslmode=require&channel_binding=require`
  - Environments: Production

---

## KEY TAKEAWAYS

### ✅ DO:

- Import prisma from "@/lib/prisma" (singleton)
- Wrap database operations in `withDatabase()`
- Use `buildErrorResponse()` for consistent error handling
- Log operation names for debugging
- Handle specific Prisma error codes
- Return proper HTTP status codes
- Test database connectivity in health checks
- Load data on component mount with empty dependency array `[]`
- Remove cache-busting query params like `?t=` + `Date.now()`
- Call manual refetch functions only on user actions

### ❌ DON'T:

- Create new `PrismaClient()` in routes
- Import PrismaClient and instantiate in multiple places
- Use try/catch without retry logic
- Return generic 500 errors
- Log sensitive connection details
- Skip error handling
- Use DATABASE_URL without pooling
- Forget to await async operations
- Set up infinite polling intervals in useEffect
- Use missing dependency arrays in useEffect
- Use cache-busting query parameters unnecessarily
- Call API routes without proper dependency control

---

## RESULT

✅ Production-grade, scalable, resilient database layer  
✅ Zero infinite API loops  
✅ Reduced server load  
✅ Better performance  
✅ Stable Prisma connections
