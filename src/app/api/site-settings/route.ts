// Site settings API — GET (public), POST (admin only)
// Stores hero text, images, and other editable site content
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

// GET — public, returns all settings as key-value pairs
export async function GET() {
  const settings = await db.siteSetting.findMany()
  const result: Record<string, string> = {}
  for (const s of settings) result[s.id] = s.value
  return NextResponse.json({ settings: result })
}

// POST — admin only, upsert a setting
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, value } = body
  if (!id || value === undefined) {
    return NextResponse.json({ error: 'id and value required' }, { status: 400 })
  }
  const setting = await db.siteSetting.upsert({
    where: { id: String(id) },
    update: { value: String(value) },
    create: { id: String(id), value: String(value) },
  })
  return NextResponse.json({ setting })
}
