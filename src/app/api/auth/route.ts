// ============================================================
// Eliya Tours API — admin PIN authentication
// POST /api/auth  { email, pin }  -> { token, user }
// GET  /api/auth
// DELETE /api/auth
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const SESSION_COOKIE = 'eliya_admin_session'

function makeToken(userId: string, email: string): string {
  const expires = Date.now() + 1000 * 60 * 60 * 12 // 12 hours
  const payload = `${userId}|${email}|${expires}`
  return Buffer.from(payload).toString('base64')
}

function parseToken(token: string): { userId: string; email: string; expires: number } | null {
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

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { email, pin } = body

  if (!email || !pin) {
    return NextResponse.json({ error: 'Email and PIN are required' }, { status: 400 })
  }

  const user = await db.adminUser.findUnique({ where: { email: String(email).toLowerCase() } })
  if (!user || !user.active || user.pin !== String(pin)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = makeToken(user.id, user.email)
  const res = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
  return res
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ user: null })
  const session = parseToken(token)
  if (!session) return NextResponse.json({ user: null })

  const user = await db.adminUser.findUnique({ where: { id: session.userId } })
  if (!user || !user.active) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('eliya_admin_session', '', { path: '/', maxAge: 0 })
  return res
}
