/**
 * PRISMA + POSTGRESQL PRODUCTION DEPLOYMENT GUIDE
 * 
 * This guide ensures your Next.js + Prisma + PostgreSQL setup is production-safe
 * and handles connection issues properly.
 */

// ============================================================================
// 1. ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * CRITICAL: Connection Pooling Setup
 * 
 * The "Error { kind: Closed }" error is typically caused by:
 * - Missing connection pooling for serverless environments
 * - Incorrect database URL format
 * - Too many simultaneous connections
 * - Connection timeouts
 * 
 * For Neon PostgreSQL (RECOMMENDED):
 * - Use the POOLER endpoint, NOT the direct connection endpoint
 * - Format: postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/database?sslmode=require&channel_binding=require
 * - Pooler uses PgBouncer for connection pooling
 * 
 * Example .env configuration for Neon:
 * DATABASE_URL='postgresql://neondb_owner:npg_xxxxx@ep-xxxx-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
 * 
 * For Standard PostgreSQL:
 * - Add pgbouncer or use built-in connection pooling
 * - Format: postgresql://user:password@localhost:5432/database?sslmode=require
 * - Add these parameters:
 *   - connect_timeout=30 (30 seconds)
 *   - idle_in_transaction_session_timeout=30000 (30 seconds)
 *   - statement_timeout=30000 (30 seconds)
 */

// ============================================================================
// 2. PRISMA CLIENT SINGLETON PATTERN (ALREADY IMPLEMENTED)
// ============================================================================

/**
 * Location: lib/prisma.ts
 * 
 * The singleton pattern prevents multiple PrismaClient instances from being
 * created during Next.js hot-reload in development.
 * 
 * Key features:
 * - Uses globalThis to cache the client
 * - Creates new instance only if none exists
 * - Automatically caches in development (NODE_ENV !== "production")
 * - Production creates fresh instance per execution
 * 
 * DO NOT DO THIS (will cause connection leaks):
 * ❌ const prisma = new PrismaClient(); // in each route
 * ❌ import { PrismaClient } from "@prisma/client"; // and create new instance
 * 
 * DO THIS INSTEAD (correct pattern):
 * ✅ import { prisma } from "@/lib/prisma"; // shared singleton
 */

// ============================================================================
// 3. DATABASE OPERATION WRAPPER (ALREADY IMPLEMENTED)
// ============================================================================

/**
 * Location: lib/db.ts
 * 
 * Provides:
 * - Automatic retry logic with exponential backoff
 * - Connection error detection and handling
 * - Graceful error responses
 * - Type-safe error building
 * 
 * Usage in API routes:
 * 
 * const data = await withDatabase(async () => {
 *   return await prisma.user.findMany();
 * }, "Fetch all users");
 * 
 * Features:
 * - Retries up to 3 times on connection errors
 * - Exponential backoff: 100ms, 200ms, 400ms
 * - Identifies connection vs. data errors
 * - Returns proper HTTP status codes
 */

// ============================================================================
// 4. API ROUTE PATTERN (ALREADY UPDATED)
// ============================================================================

/**
 * All API routes now follow this pattern:
 * 
 * import { withDatabase, buildErrorResponse } from "@/lib/db";
 * 
 * export async function GET() {
 *   try {
 *     const data = await withDatabase(async () => {
 *       return await prisma.model.findMany();
 *     }, "GET /api/endpoint");
 * 
 *     return NextResponse.json(data);
 *   } catch (error) {
 *     const { message, status } = buildErrorResponse(error);
 *     return NextResponse.json({ error: message }, { status });
 *   }
 * }
 */

// ============================================================================
// 5. PRODUCTION DEPLOYMENT CHECKLIST
// ============================================================================

/**
 * Before deploying to production, ensure:
 * 
 * ✅ DATABASE_URL uses connection pooler endpoint (e.g., Neon pooler)
 * ✅ DATABASE_URL includes all required parameters:
 *    - sslmode=require (for security)
 *    - channel_binding=require (for Neon)
 *    - Optional: statement_timeout=30000, connect_timeout=30
 * 
 * ✅ Environment variables are set in production platform:
 *    - Vercel: Settings > Environment Variables
 *    - Railway: Variables section
 *    - AWS: Systems Manager Parameter Store or Secrets Manager
 *    - Docker: .env file (never commit to git)
 * 
 * ✅ Prisma schema is synced:
 *    $ npx prisma migrate deploy
 * 
 * ✅ Database backups are configured (critical for production data)
 * 
 * ✅ Monitoring/Alerting is set up for database connection errors
 * 
 * ✅ NODE_ENV is set to "production"
 * 
 * ✅ Error logs are configured to alert on "Closed" or "connection" errors
 */

// ============================================================================
// 6. TROUBLESHOOTING CONNECTION ERRORS
// ============================================================================

/**
 * Error: "Error { kind: Closed, cause: None }"
 * Solution: Use connection pooler (Neon pooler endpoint)
 * 
 * Error: "P1002 - Cannot find a database server at..."
 * Solution: Check DATABASE_URL is correct and database is online
 * 
 * Error: "ECONNREFUSED" or "Connection refused"
 * Solution: Database server is down or unreachable
 * 
 * Error: "SSL/TLS connection error"
 * Solution: Add sslmode=require to DATABASE_URL
 * 
 * Timeout errors during heavy load:
 * Solution: Increase pool size or use PgBouncer
 */

// ============================================================================
// 7. PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * For high-traffic applications:
 * 
 * 1. Use connection pooling (already implemented via DATABASE_URL)
 * 
 * 2. Batch database operations:
 *    ✅ DO: await prisma.user.findMany({ where: { ... } })
 *    ❌ DON'T: Loop and call prisma.user.findUnique() multiple times
 * 
 * 3. Use select/include to avoid over-fetching:
 *    ✅ DO: prisma.user.findMany({ select: { id: true, name: true } })
 *    ❌ DON'T: prisma.user.findMany() // fetches all fields
 * 
 * 4. Cache frequently accessed data:
 *    - Consider Redis for session/cache layer
 *    - Use Next.js revalidateTags() for ISR
 * 
 * 5. Monitor database performance:
 *    - Check query execution times in database logs
 *    - Use EXPLAIN ANALYZE for slow queries
 */

// ============================================================================
// 8. NEON SPECIFIC SETUP (RECOMMENDED FOR SERVERLESS)
// ============================================================================

/**
 * Why Neon for Next.js/Serverless?
 * - Built-in connection pooling (PgBouncer)
 * - Branching for testing
 * - Autoscaling compute
 * - Perfect for Vercel deployments
 * 
 * Setup Steps:
 * 1. Create Neon project at https://console.neon.tech
 * 2. Copy Pooler connection string (NOT the direct one)
 * 3. Set DATABASE_URL in .env and production platform
 * 4. Run: npx prisma migrate deploy
 * 
 * Neon Connection String Example:
 * postgresql://neondb_owner:password@ep-aged-band-ai2iv34a-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
 *
 * Key parts:
 * - ep-aged-band-ai2iv34a-pooler = pooler endpoint (critical!)
 * - c-4 = region identifier
 * - us-east-1 = AWS region
 * - sslmode=require = enforce SSL
 * - channel_binding=require = Neon-specific security
 */

// ============================================================================
// 9. MONITORING & LOGGING
// ============================================================================

/**
 * Monitor these patterns:
 * - "[Database] Connection test failed"
 * - "Attempt X failed, retrying in Xms..."
 * - "Error { kind: Closed }"
 * - "P1002", "P1001" (connection errors)
 * 
 * Set up alerts for:
 * - Error rate > 5%
 * - Average response time > 2s
 * - Any "Closed" connection errors
 * 
 * Log aggregation services:
 * - Vercel: Built-in logs
 * - Railway: Dashboard logs
 * - DataDog: Advanced monitoring
 * - Sentry: Error tracking
 */

// ============================================================================
// 10. MIGRATION SAFETY
// ============================================================================

/**
 * For production database schema changes:
 * 
 * 1. Create migration locally:
 *    $ npx prisma migrate dev --name add_new_field
 * 
 * 2. Review generated migration in prisma/migrations/
 * 
 * 3. Test on staging environment first
 * 
 * 4. Deploy to production:
 *    $ npx prisma migrate deploy
 * 
 * NEVER run:
 * ❌ npx prisma db push (destructive)
 * ❌ Direct SQL without migrations (lose history)
 */

export const CONFIG = {
  // Production environment check
  isProduction: process.env.NODE_ENV === "production",
  
  // Connection pooling requirements
  requiresPooling: true,
  
  // Recommended providers for Next.js
  recommendedProviders: ["Neon", "Railway", "AWS RDS Proxy"],
  
  // Connection retry configuration
  maxRetries: 3,
  initialRetryDelay: 100, // milliseconds
  maxRetryDelay: 1000,
  
  // Connection timeout (Neon default: 30s)
  connectionTimeout: 30000,
};

// ============================================================================
// QUICK START COMMANDS
// ============================================================================

/**
 * Setup Prisma migrations:
 * $ npx prisma migrate dev --name init
 * 
 * Deploy migrations to production:
 * $ npx prisma migrate deploy
 * 
 * Test database connection:
 * $ npx prisma db execute --stdin < <(echo "SELECT 1;")
 * 
 * Generate Prisma Client:
 * $ npx prisma generate
 * 
 * View Prisma Studio (local development):
 * $ npx prisma studio
 */
