// ============================================================
// Enquiries API
// POST /api/enquiries — create (public)
// GET  /api/enquiries — list (admin only)
// PATCH /api/enquiries?id=... — update status (admin only)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notify'
import { rateLimit, getClientIP, rateLimitResponse, sanitizeString, sanitizeEmail, isValidEmail } from '@/lib/security'

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

// POST — public submission
export async function POST(req: NextRequest) {
  // Rate limit: 5 enquiries per IP per hour (spam protection)
  const ip = getClientIP(req)
  const rl = rateLimit(`enquiry:${ip}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt)
  }

  const body = await req.json().catch(() => ({}))
  const { name, email, phone, destination, dates, party, notes } = body

  if (!name || !email || !destination || !dates || !party) {
    return NextResponse.json(
      { error: 'Missing required fields: name, email, destination, dates, party' },
      { status: 400 }
    )
  }

  // Validate + sanitize all inputs
  const cleanEmail = sanitizeEmail(String(email))
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const cleanName = sanitizeString(String(name), 100)
  const cleanDestination = sanitizeString(String(destination), 100)
  const cleanDates = sanitizeString(String(dates), 100)
  const cleanParty = sanitizeString(String(party), 100)

  if (!cleanName || !cleanDestination || !cleanDates || !cleanParty) {
    return NextResponse.json({ error: 'Fields cannot be empty' }, { status: 400 })
  }

  const enquiry = await db.enquiry.create({
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: phone ? sanitizeString(String(phone), 20) : null,
      destination: cleanDestination,
      dates: cleanDates,
      party: cleanParty,
      notes: notes ? sanitizeString(String(notes), 2000) : null,
      status: 'new',
    },
  })

  // Push in-app notification to all admins
  await createNotification({
    userId: 'all',
    userType: 'admin',
    type: 'enquiry',
    title: `New enquiry from ${cleanName}`,
    message: `${cleanDestination} · ${cleanDates} · ${cleanParty}`,
    link: '#/admin',
  })

  return NextResponse.json({ ok: true, id: enquiry.id })
}

// GET — admin list
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const where = status ? { status } : {}
  const enquiries = await db.enquiry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json({ enquiries })
}

// PATCH — admin update status
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, status, assignedTo } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const enquiry = await db.enquiry.update({
    where: { id: String(id) },
    data: {
      ...(status ? { status: String(status) } : {}),
      ...(assignedTo !== undefined ? { assignedTo: String(assignedTo) } : {}),
    },
  })
  return NextResponse.json({ enquiry })
}
