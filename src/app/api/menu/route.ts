// Menu API — GET (public), POST/PATCH/DELETE (admin)
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
  } catch { return null }
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
  const mealType = url.searchParams.get('mealType')

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (mealType) where.mealType = mealType

  const items = await db.menuItem.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  if (!body.name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const item = await db.menuItem.create({
    data: {
      name: String(body.name),
      description: String(body.description || ''),
      category: String(body.category || 'Main Course'),
      mealType: String(body.mealType || 'veg'),
      price: Number(body.price) || 0,
      image: body.image ? String(body.image) : null,
      available: body.available !== undefined ? Boolean(body.available) : true,
    },
  })
  return NextResponse.json({ item })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) {
      if (k === 'price') data[k] = Number(v)
      else if (k === 'available') data[k] = Boolean(v)
      else data[k] = v
    }
  }

  const item = await db.menuItem.update({ where: { id: String(id) }, data })
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.menuItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
