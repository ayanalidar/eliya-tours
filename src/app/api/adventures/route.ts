// ============================================================
// Adventure sports API
// GET /api/adventures · list all (or filter by ?category= or ?destinationId=)
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
  const category = url.searchParams.get('category')
  const destinationId = url.searchParams.get('destinationId')

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (destinationId) where.destinationId = destinationId

  const adventures = await db.adventureSport.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ adventures })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  if (!body.id || !body.name || !body.category) {
    return NextResponse.json({ error: 'id, name, category required' }, { status: 400 })
  }

  const sport = await db.adventureSport.create({
    data: {
      id: String(body.id),
      name: String(body.name),
      category: String(body.category),
      destinationId: String(body.destinationId || ''),
      season: String(body.season || ''),
      description: String(body.description || ''),
      longDescription: String(body.longDescription || ''),
      image: String(body.image || ''),
      priceFrom: Number(body.priceFrom) || 0,
      duration: String(body.duration || ''),
      difficulty: String(body.difficulty || 'Beginner'),
      minAge: Number(body.minAge) || 10,
      maxGroup: Number(body.maxGroup) || 8,
      gear: String(body.gear || '[]'),
      safety: String(body.safety || '[]'),
    },
  })
  return NextResponse.json({ sport })
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
      if (['priceFrom', 'minAge', 'maxGroup'].includes(k)) data[k] = Number(v)
      else data[k] = v
    }
  }

  const sport = await db.adventureSport.update({ where: { id: String(id) }, data })
  return NextResponse.json({ sport })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.adventureSport.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
