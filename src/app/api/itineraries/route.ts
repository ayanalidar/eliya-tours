// ============================================================
// Itineraries API · admin builder
// GET /api/itineraries · list
// POST · create
// PATCH · update
// DELETE · delete
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

export async function GET() {
  const itineraries = await db.itinerary.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ itineraries })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  if (!body.name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const it = await db.itinerary.create({
    data: {
      name: String(body.name),
      description: body.description ? String(body.description) : null,
      days: String(body.days || '[]'),
      totalCost: Number(body.totalCost) || 0,
      createdBy: body.createdBy ? String(body.createdBy) : null,
    },
  })
  return NextResponse.json({ itinerary: it })
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
      if (k === 'totalCost') data[k] = Number(v)
      else data[k] = v
    }
  }

  const it = await db.itinerary.update({ where: { id: String(id) }, data })
  return NextResponse.json({ itinerary: it })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.itinerary.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
