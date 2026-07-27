// ============================================================
// Offers API
// GET /api/offers — list active offers (public)
// POST/PATCH/DELETE — admin only
// POST /api/offers?validate=code — validate a code (public)
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
  const code = url.searchParams.get('validate')

  if (code) {
    // Public: validate a code
    const offer = await db.offer.findUnique({ where: { code: code.toUpperCase() } })
    if (!offer || !offer.active) {
      return NextResponse.json({ valid: false, discountPct: 0 })
    }
    const now = new Date()
    if (now < offer.validFrom || now > offer.validTo) {
      return NextResponse.json({ valid: false, discountPct: 0, reason: 'expired' })
    }
    return NextResponse.json({
      valid: true,
      discountPct: offer.discountPct,
      title: offer.title,
      description: offer.description,
      code: offer.code,
    })
  }

  // Public: list active offers
  const now = new Date()
  const offers = await db.offer.findMany({
    where: {
      active: true,
      validFrom: { lte: now },
      validTo: { gte: now },
    },
    orderBy: { validTo: 'asc' },
  })
  return NextResponse.json({ offers })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  if (!body.title || !body.code) {
    return NextResponse.json({ error: 'title and code required' }, { status: 400 })
  }

  const offer = await db.offer.create({
    data: {
      title: String(body.title),
      description: String(body.description || ''),
      code: String(body.code).toUpperCase(),
      discountPct: Number(body.discountPct) || 0,
      validFrom: new Date(body.validFrom || Date.now()),
      validTo: new Date(body.validTo || Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: body.active !== undefined ? Boolean(body.active) : true,
    },
  })
  return NextResponse.json({ offer })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) {
      if (k === 'discountPct') data[k] = Number(v)
      else if (k === 'active') data[k] = Boolean(v)
      else if (k === 'validFrom' || k === 'validTo') data[k] = new Date(v as string)
      else data[k] = v
    }
  }

  const offer = await db.offer.update({ where: { id: String(id) }, data })
  return NextResponse.json({ offer })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.offer.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
