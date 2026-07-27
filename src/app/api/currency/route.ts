// ============================================================
// Currency API — fetches live rates from open.er-api.com (free, no key)
// Caches in DB for 24 hours. Falls back to fixed rates if API fails.
// GET /api/currency?base=INR
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Fallback rates (approximate, INR base)
const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
  AED: 0.044,
  SGD: 0.016,
  AUD: 0.018,
  CAD: 0.016,
}

const CURRENCY_META: Record<string, { symbol: string; name: string }> = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const base = (url.searchParams.get('base') || 'INR').toUpperCase()

  // Check cache (24h)
  const cached = await db.currencyRate.findUnique({ where: { base } })
  const cacheAge = cached ? Date.now() - cached.fetchedAt.getTime() : Infinity

  let rates: Record<string, number>

  if (cached && cacheAge < 24 * 60 * 60 * 1000) {
    rates = JSON.parse(cached.rates)
  } else {
    // Fetch fresh from open.er-api.com (free, no key)
    try {
      const r = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
        next: { revalidate: 86400 },
      })
      const data = await r.json()
      if (data.rates) {
        rates = data.rates
        // Update cache
        await db.currencyRate.upsert({
          where: { base },
          update: { rates: JSON.stringify(rates), fetchedAt: new Date() },
          create: { base, rates: JSON.stringify(rates), fetchedAt: new Date() },
        })
      } else {
        rates = FALLBACK_RATES
      }
    } catch {
      rates = FALLBACK_RATES
    }
  }

  // Filter to supported currencies + include meta
  const supported = Object.keys(CURRENCY_META)
  const filtered: Record<string, { rate: number; symbol: string; name: string }> = {}
  for (const code of supported) {
    filtered[code] = {
      rate: rates[code] || FALLBACK_RATES[code] || 1,
      symbol: CURRENCY_META[code].symbol,
      name: CURRENCY_META[code].name,
    }
  }

  return NextResponse.json({
    base,
    rates: filtered,
    fetchedAt: cached?.fetchedAt || new Date(),
  })
}
