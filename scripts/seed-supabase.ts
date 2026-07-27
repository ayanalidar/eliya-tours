#!/usr/bin/env bun
// ============================================================
// Seed Supabase from your local machine
//
// Usage:
//   1. Make sure you have Bun installed: https://bun.sh
//   2. Clone the repo: git clone https://github.com/ayanalidar/eliya-tours.git
//   3. cd eliya-tours && bun install
//   4. Run this script with the DIRECT connection (port 5432) for schema push:
//      DATABASE_URL="postgresql://postgres:Ayanalidar%40110@db.ssndwdauxdwwvfnafiuh.supabase.co:5432/postgres" bun run scripts/seed-supabase.ts
//
// NOTE: Use the DIRECT connection (db.ssndwdauxdwwvfnafiuh.supabase.co:5432) for this
// seed script, NOT the pooler. The pooler (port 6543) is for the Vercel runtime.
//
// This will:
//   - Create all 17 tables (via prisma db push)
//   - Seed 21 destinations, 6 seasons, 8 hotels, 3 admins
//   - Seed 18 adventure sports
//   - Seed 5 offers, 12 seasonal prices, 5 sample reviews
// ============================================================

import { execSync } from 'child_process'

const DB_URL = process.env.DATABASE_URL
if (!DB_URL || DB_URL.startsWith('file:')) {
  console.error('❌ Set DATABASE_URL to your Supabase DIRECT connection string')
  console.error('   Example: DATABASE_URL="postgresql://postgres:PASSWORD@db.ssndwdauxdwwvfnafiuh.supabase.co:5432/postgres" bun run scripts/seed-supabase.ts')
  process.exit(1)
}

console.log('🚀 Seeding Supabase...')
console.log(`   URL: ${DB_URL.replace(/:[^:@]+@/, ':****@')}`)
console.log('')

// Step 1: Push schema (creates tables)
console.log('📋 Step 1/4: Creating tables (prisma db push)...')
try {
  execSync('bun run db:push', { stdio: 'inherit', env: process.env })
} catch {
  console.error('\n❌ Failed to push schema. Common causes:')
  console.error('   1. Supabase project is still provisioning (wait 5 min after creation)')
  console.error('   2. Your network blocks outbound port 5432')
  console.error('   3. Wrong password (make sure @ is URL-encoded as %40)')
  process.exit(1)
}

// Step 2: Seed destinations, seasons, hotels, admins
console.log('\n📋 Step 2/4: Seeding destinations, seasons, hotels, admins...')
execSync('bun run scripts/seed.ts', { stdio: 'inherit', env: process.env })

// Step 3: Seed adventures
console.log('\n📋 Step 3/4: Seeding adventure sports...')
execSync('bun run scripts/seed-adventures.ts', { stdio: 'inherit', env: process.env })

// Step 4: Seed offers, pricing, reviews
console.log('\n📋 Step 4/4: Seeding offers, seasonal pricing, reviews...')
execSync('bun run scripts/seed-extras.ts', { stdio: 'inherit', env: process.env })

console.log('\n✅ Supabase seeded successfully!')
console.log('   Your Vercel deployment will now have all data.')
console.log('   Visit your Vercel URL to see the live site.')
