import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma for serverless (Vercel) + Supabase pooler
// - connection_limit=1: only 1 connection per Prisma client instance
//   (Vercel serverless reuses the client via globalThis)
// - pool_timeout=10: wait max 10s for a connection before failing
// - pgbouncer=true: tells Prisma to use PgBouncer-compatible mode
//   (required for Supabase pooler / Transaction mode)
function buildDatasourceUrl(): string {
  const baseUrl = process.env.DATABASE_URL || ''
  // Already has query params? Append ours
  const separator = baseUrl.includes('?') ? '&' : '?'
  // Only add if not already present
  const params: string[] = []
  if (!baseUrl.includes('connection_limit')) params.push('connection_limit=1')
  if (!baseUrl.includes('pool_timeout')) params.push('pool_timeout=10')
  if (!baseUrl.includes('pgbouncer')) params.push('pgbouncer=true')
  if (params.length === 0) return baseUrl
  return baseUrl + separator + params.join('&')
}

const datasourceUrl = buildDatasourceUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: { url: datasourceUrl },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db