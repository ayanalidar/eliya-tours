// ============================================================
// Hotels API · list, get, create, update, delete
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
  const destinationId = url.searchParams.get('destinationId')

  if (id) {
    const h = await db.hotel.findUnique({ where: { id } })
    if (!h) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ hotel: h })
  }

  const where = destinationId ? { destinationId } : {}
  const hotels = await db.hotel.findMany({
    where,
    orderBy: [{ starRating: 'desc' }, { name: 'asc' }],
  })
  return NextResponse.json({ hotels })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  if (!body.id || !body.name || !body.destinationId) {
    return NextResponse.json({ error: 'id, name, destinationId required' }, { status: 400 })
  }

  const hotel = await db.hotel.create({
    data: {
      id: String(body.id),
      name: String(body.name),
      destinationId: String(body.destinationId),
      type: String(body.type || 'Hotel'),
      starRating: Number(body.starRating) || 3,
      description: String(body.description || ''),
      longDescription: String(body.longDescription || ''),
      image: String(body.image || ''),
      gallery: String(body.gallery || '[]'),
      priceFrom: Number(body.priceFrom) || 0,
      amenities: String(body.amenities || '[]'),
      rooms: Number(body.rooms) || 0,
      checkIn: String(body.checkIn || '12:00'),
      checkOut: String(body.checkOut || '11:00'),
    },
  })
  return NextResponse.json({ hotel })
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
      if (['starRating', 'priceFrom', 'rooms'].includes(k)) data[k] = Number(v)
      else data[k] = v
    }
  }

  const hotel = await db.hotel.update({ where: { id: String(id) }, data })
  return NextResponse.json({ hotel })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.hotel.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
