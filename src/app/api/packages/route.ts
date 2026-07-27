// ============================================================
// Packages API — list/get/create/update/delete (admin only for writes)
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
    const p = await db.package.findUnique({ where: { id } })
    if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ package: p })
  }

  const packages = await db.package.findMany({
    where: { active: true },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ packages })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  if (!body.title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const slug = String(body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))

  const pkg = await db.package.create({
    data: {
      title: String(body.title),
      slug,
      description: String(body.description || ''),
      duration: String(body.duration || ''),
      price: Number(body.price) || 0,
      destinations: String(body.destinations || '[]'),
      inclusions: String(body.inclusions || '[]'),
      exclusions: String(body.exclusions || '[]'),
      itinerary: String(body.itinerary || '[]'),
      image: body.image ? String(body.image) : null,
      featured: Boolean(body.featured),
      active: Boolean(body.active ?? true),
      createdBy: String(body.createdBy || ''),
    },
  })
  return NextResponse.json({ package: pkg })
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
      if (k === 'price') data[k] = Number(v)
      else if (k === 'featured' || k === 'active') data[k] = Boolean(v)
      else data[k] = v
    }
  }

  const pkg = await db.package.update({ where: { id: String(id) }, data })
  return NextResponse.json({ package: pkg })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.package.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
