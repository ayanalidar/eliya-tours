// ============================================================
// Guest auth · PIN-based login for guest portal
// POST /api/guest-auth { email, pin }  · login
// POST /api/guest-auth?action=register { name, email, phone, pin } · register
// GET /api/guest-auth · current session
// DELETE /api/guest-auth · logout
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIP, rateLimitResponse, sanitizeEmail, sanitizeString, isValidPin, isValidEmail } from '@/lib/security'

const GUEST_COOKIE = 'eliya_guest_session'

function makeToken(userId: string, email: string): string {
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30 // 30 days
  const payload = `${userId}|${email}|${expires}`
  return Buffer.from(payload).toString('base64')
}

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

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per IP per 15 minutes (brute-force protection)
  const ip = getClientIP(req)
  const rl = rateLimit(`guest-auth:${ip}`, 5, 15 * 60 * 1000)
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt)
  }

  const body = await req.json().catch(() => ({}))
  const action = body.action

  if (action === 'register') {
    const { name, email, phone, pin } = body
    if (!name || !email || !pin) {
      return NextResponse.json({ error: 'name, email, pin required' }, { status: 400 })
    }

    const cleanName = sanitizeString(String(name), 100)
    const cleanEmail = sanitizeEmail(String(email))
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (!isValidPin(String(pin))) {
      return NextResponse.json({ error: 'PIN must be 6 digits' }, { status: 400 })
    }

    const existing = await db.guest.findUnique({ where: { email: cleanEmail } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered. Log in instead.' }, { status: 400 })
    }

    const guest = await db.guest.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: phone ? sanitizeString(String(phone), 20) : null,
        pin: String(pin),
      },
    })

    const token = makeToken(guest.id, guest.email)
    const res = NextResponse.json({
      guest: { id: guest.id, name: guest.name, email: guest.email, phone: guest.phone },
    })
    res.cookies.set(GUEST_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  }

  // Login
  const { email, pin } = body
  if (!email || !pin) {
    return NextResponse.json({ error: 'Email and PIN required' }, { status: 400 })
  }

  const cleanEmail = sanitizeEmail(String(email))
  if (!isValidEmail(cleanEmail) || !isValidPin(String(pin))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const guest = await db.guest.findUnique({ where: { email: cleanEmail } })
  // Same error for both cases (prevent user enumeration)
  if (!guest || guest.pin !== String(pin)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = makeToken(guest.id, guest.email)
  const res = NextResponse.json({
    guest: { id: guest.id, name: guest.name, email: guest.email, phone: guest.phone },
  })
  res.cookies.set(GUEST_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(GUEST_COOKIE)?.value
  if (!token) return NextResponse.json({ guest: null })
  const session = parseToken(token)
  if (!session) return NextResponse.json({ guest: null })

  const guest = await db.guest.findUnique({ where: { id: session.userId } })
  if (!guest) return NextResponse.json({ guest: null })

  return NextResponse.json({
    guest: { id: guest.id, name: guest.name, email: guest.email, phone: guest.phone },
  })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(GUEST_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
