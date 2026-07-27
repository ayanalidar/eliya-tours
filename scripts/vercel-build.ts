// ============================================================
// Vercel build script — runs during `vercel-build`
// 1. prisma generate
// 2. prisma db push (creates tables if they don't exist)
// 3. next build
//
// If the DB is unreachable, it skips the db push and continues
// with the build (the runtime will retry the connection).
//
// To enable auto-seeding during build, set SEED_ON_BUILD=true
// in Vercel env vars. This is useful for the first deploy.
// ============================================================
import { execSync } from 'child_process'

const run = (cmd: string, label: string, required = true) => {
  console.log(`\n▶ ${label}`)
  try {
    execSync(cmd, { stdio: 'inherit', env: process.env })
    console.log(`✓ ${label} — done`)
  } catch (e) {
    if (required) {
      console.error(`✗ ${label} — FAILED`)
      process.exit(1)
    } else {
      console.log(`⚠ ${label} — skipped (non-fatal)`)
    }
  }
}

console.log('🚀 Eliya Tours — Vercel build starting...')

// Step 1: Generate Prisma client (always required)
run('prisma generate', 'Generate Prisma client', true)

// Step 2: Push schema to DB (creates tables) — non-fatal if DB unreachable
// We use the pooler URL (set in Vercel env vars) which Vercel can reach.
run('prisma db push --accept-data-loss', 'Push schema to database (creates tables)', false)

// Step 3: Optionally seed the database (set SEED_ON_BUILD=true for first deploy)
if (process.env.SEED_ON_BUILD === 'true') {
  console.log('\n▶ Seed database (SEED_ON_BUILD=true)')
  run('bun run scripts/seed.ts', 'Seed destinations/seasons/hotels/admins', false)
  run('bun run scripts/seed-adventures.ts', 'Seed adventure sports', false)
  run('bun run scripts/seed-extras.ts', 'Seed offers/pricing/reviews', false)
  console.log('✓ Seeding complete')
  console.log('⚠ NOTE: Set SEED_ON_BUILD=false (or remove it) for subsequent deploys to avoid duplicate data.')
} else {
  console.log('\nℹ Skipping seed (set SEED_ON_BUILD=true to seed on next deploy)')
}

// Step 4: Build Next.js (always required)
run('next build', 'Build Next.js app', true)

console.log('\n✅ Vercel build complete!')
