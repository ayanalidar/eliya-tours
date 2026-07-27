// ============================================================
// Seasons API — list, get, create, update, delete
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
  const id = url.searchParams.get('id')

  if (id) {
    const s = await db.season.findUnique({ where: { id } })
    if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ season: s })
  }

  const seasons = await db.season.findMany({ orderBy: [{ id: 'asc' }] })
  return NextResponse.json({ seasons })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  if (!body.id || !body.title) {
    return NextResponse.json({ error: 'id and title required' }, { status: 400 })
  }

  const season = await db.season.create({
    data: {
      id: String(body.id),
      season: String(body.season || ''),
      months: String(body.months || ''),
      title: String(body.title),
      theme: String(body.theme || ''),
      description: String(body.description || ''),
      longDescription: String(body.longDescription || ''),
      image: String(body.image || ''),
      color: String(body.color || 'oklch(0.55 0.15 165)'),
      priceFrom: Number(body.priceFrom) || 0,
      duration: String(body.duration || ''),
      isFeatured: Boolean(body.isFeatured),
      destinations: String(body.destinations || '[]'),
      itinerary: String(body.itinerary || '[]'),
    },
  })
  return NextResponse.json({ season })
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
      if (k === 'priceFrom') data[k] = Number(v)
      else if (k === 'isFeatured') data[k] = Boolean(v)
      else data[k] = v
    }
  }

  const season = await db.season.update({ where: { id: String(id) }, data })
  return NextResponse.json({ season })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.season.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
