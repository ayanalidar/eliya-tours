// ============================================================
// Seasonal pricing API · admin manages per-hotel per-month multipliers
// GET /api/seasonal-pricing?hotelId=... · list overrides for hotel
// POST · create or update
// DELETE · remove
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SESSION_COOKIE = 'eliya_admin_session'

function parseToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const [userId, email, expiresStr] = decoded.split('|')
    const expires = Number(expiresStr)
    if (!userId || !email || !expires) return null
    if (Date.now() > expires) return null
    return { userId, email, expires }
  } catch {
    return null
  }
}

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return false
  const session = parseToken(token)
  if (!session) return false
  const user = await db.adminUser.findUnique({ where: { id: session.userId } })
  return !!user && user.active
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const hotelId = url.searchParams.get('hotelId')

  if (!hotelId) {
    // Public: list all (for display)
    const all = await db.seasonalPrice.findMany()
    return NextResponse.json({ prices: all })
  }

  const prices = await db.seasonalPrice.findMany({ where: { hotelId } })
  return NextResponse.json({ prices })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { hotelId, month, multiplier, note } = body
  if (!hotelId || !month) {
    return NextResponse.json({ error: 'hotelId and month required' }, { status: 400 })
  }
  const m = Number(month)
  if (m < 1 || m > 12) {
    return NextResponse.json({ error: 'month must be 1-12' }, { status: 400 })
  }

  // Upsert by unique [hotelId, month]
  const price = await db.seasonalPrice.upsert({
    where: { hotelId_month: { hotelId: String(hotelId), month: m } },
    update: {
      multiplier: Number(multiplier) || 1.0,
      note: note ? String(note) : null,
    },
    create: {
      hotelId: String(hotelId),
      month: m,
      multiplier: Number(multiplier) || 1.0,
      note: note ? String(note) : null,
    },
  })
  return NextResponse.json({ price })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.seasonalPrice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
