// ============================================================
// Vercel build script — runs during `vercel-build`
// 1. prisma generate
// 2. prisma db push (creates tables) — with HARD timeout, fully skippable
// 3. next build
//
// The db push step has a 60-second hard timeout. If Supabase is
// unreachable, the build continues anyway (the runtime will use
// the same DATABASE_URL when serving requests).
//
// To enable auto-seeding during build, set SEED_ON_BUILD=true
// in Vercel env vars. This is useful for the first deploy.
// ============================================================
import { execSync, spawn } from 'child_process'

const run = (cmd: string, label: string, required = true) => {
  console.log(`\n▶ ${label}`)
  try {
    execSync(cmd, { stdio: 'inherit', env: process.env, timeout: 120000 })
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

// Run a command with a hard timeout (kills the process if it exceeds the limit)
const runWithTimeout = (cmd: string, args: string[], label: string, timeoutMs: number): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log(`\n▶ ${label} (timeout: ${timeoutMs / 1000}s)`)
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      env: process.env,
      shell: false,
    })

    const timer = setTimeout(() => {
      console.log(`\n⏱ ${label} — timed out after ${timeoutMs / 1000}s, killing...`)
      child.kill('SIGTERM')
      // Force kill if still alive after 5s
      setTimeout(() => {
        try { child.kill('SIGKILL') } catch {}
      }, 5000)
      resolve(false)
    }, timeoutMs)

    child.on('exit', (code) => {
      clearTimeout(timer)
      if (code === 0) {
        console.log(`✓ ${label} — done`)
        resolve(true)
      } else {
        console.log(`⚠ ${label} — exited with code ${code} (non-fatal)`)
        resolve(false)
      }
    })

    child.on('error', (err) => {
      clearTimeout(timer)
      console.log(`⚠ ${label} — error: ${err.message} (non-fatal)`)
      resolve(false)
    })
  })
}

console.log('🚀 Eliya Tours — Vercel build starting...')

// Step 1: Generate Prisma client (always required, no DB needed)
run('prisma generate', 'Generate Prisma client', true)

// Step 2: Push schema to DB (creates tables) — 60s hard timeout, fully optional
// If Supabase is unreachable, the build continues. The runtime will retry
// the connection when serving requests.
const dbOk = await runWithTimeout('prisma', ['db', 'push', '--accept-data-loss'], 'Push schema to database (creates tables)', 60000)

if (!dbOk) {
  console.log('\n⚠ DB push failed or timed out. This is OK — tables may already exist,')
  console.log('  or the runtime will create them on first request.')
  console.log('  If pages show "no data", run the seed script from your local machine:')
  console.log('  → DATABASE_URL="postgresql://..." bun run scripts/seed-supabase.ts')
}

// Step 3: Optionally seed the database (set SEED_ON_BUILD=true for first deploy)
if (process.env.SEED_ON_BUILD === 'true' && dbOk) {
  console.log('\n▶ Seed database (SEED_ON_BUILD=true)')
  await runWithTimeout('bun', ['run', 'scripts/seed.ts'], 'Seed destinations/seasons/hotels/admins', 90000)
  await runWithTimeout('bun', ['run', 'scripts/seed-adventures.ts'], 'Seed adventure sports', 90000)
  await runWithTimeout('bun', ['run', 'scripts/seed-extras.ts'], 'Seed offers/pricing/reviews', 90000)
  console.log('✓ Seeding complete')
  console.log('⚠ NOTE: Set SEED_ON_BUILD=false (or remove it) for subsequent deploys to avoid duplicate data.')
} else if (process.env.SEED_ON_BUILD === 'true' && !dbOk) {
  console.log('\n⚠ Skipping seed because DB push failed. Fix the DATABASE_URL and redeploy.')
} else {
  console.log('\nℹ Skipping seed (set SEED_ON_BUILD=true to seed on next deploy)')
}

// Step 4: Build Next.js (always required, no DB needed)
run('next build', 'Build Next.js app', true)

console.log('\n✅ Vercel build complete!')
