// ============================================================
// Eliya Tours API · admin PIN authentication
// POST /api/auth  { email, pin }  -> { token, user }
// GET  /api/auth
// DELETE /api/auth
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIP, rateLimitResponse, sanitizeEmail, isValidPin, isValidEmail } from '@/lib/security'

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
  // Rate limit: 5 login attempts per IP per 15 minutes (brute-force protection)
  const ip = getClientIP(req)
  const rl = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt)
  }

  const body = await req.json().catch(() => ({}))
  const { email, pin } = body

  if (!email || !pin) {
    return NextResponse.json({ error: 'Email and PIN are required' }, { status: 400 })
  }

  // Validate email format
  const cleanEmail = sanitizeEmail(String(email))
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  // Validate PIN format (must be 6 digits)
  const cleanPin = String(pin)
  if (!isValidPin(cleanPin)) {
    return NextResponse.json({ error: 'PIN must be 6 digits' }, { status: 400 })
  }

  const user = await db.adminUser.findUnique({ where: { email: cleanEmail } })
  // Use same error message for both cases to prevent user enumeration
  if (!user || !user.active || user.pin !== cleanPin) {
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
    secure: process.env.NODE_ENV === 'production',
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
