// ============================================================
// Destinations API
// GET /api/destinations · list all
// GET /api/destinations?id=xxx · get one
// POST/PATCH/DELETE · admin only
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
  const area = url.searchParams.get('area')

  if (id) {
    const d = await db.destination.findUnique({ where: { id } })
    if (!d) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ destination: d })
  }

  const where = area ? { area } : {}
  const destinations = await db.destination.findMany({
    where,
    orderBy: [{ area: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ destinations })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const required = ['id', 'name', 'region', 'area', 'description', 'image']
  for (const f of required) {
    if (!body[f]) return NextResponse.json({ error: `Missing field: ${f}` }, { status: 400 })
  }

  const dest = await db.destination.create({
    data: {
      id: String(body.id),
      name: String(body.name),
      region: String(body.region || ''),
      area: String(body.area || ''),
      elevation: String(body.elevation || ''),
      bestSeason: String(body.bestSeason || ''),
      tagline: String(body.tagline || ''),
      description: String(body.description),
      longDescription: String(body.longDescription || body.description),
      image: String(body.image),
      gallery: String(body.gallery || '[]'),
      accent: String(body.accent || 'oklch(0.62 0.13 165)'),
      latitude: Number(body.latitude) || 34.0837,
      longitude: Number(body.longitude) || 74.7973,
      rating: Number(body.rating) || 4.5,
      curated: Number(body.curated) || 90,
      visitors: Number(body.visitors) || 50,
      safety: Number(body.safety) || 90,
      highlights: String(body.highlights || '[]'),
    },
  })
  return NextResponse.json({ destination: dest })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Strip undefined and convert numbers
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) {
      if (['latitude', 'longitude', 'rating'].includes(k)) data[k] = Number(v)
      else if (['curated', 'visitors', 'safety'].includes(k)) data[k] = Number(v)
      else data[k] = v
    }
  }

  const dest = await db.destination.update({ where: { id: String(id) }, data })
  return NextResponse.json({ destination: dest })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.destination.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
