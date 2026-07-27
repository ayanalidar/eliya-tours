// ============================================================
// Enquiries API
// POST /api/enquiries — create (public)
// GET  /api/enquiries — list (admin only)
// PATCH /api/enquiries?id=... — update status (admin only)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notify'

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
  const body = await req.json().catch(() => ({}))
  const { name, email, phone, destination, dates, party, notes } = body

  if (!name || !email || !destination || !dates || !party) {
    return NextResponse.json(
      { error: 'Missing required fields: name, email, destination, dates, party' },
      { status: 400 }
    )
  }

  const enquiry = await db.enquiry.create({
    data: {
      name: String(name),
      email: String(email),
      phone: phone ? String(phone) : null,
      destination: String(destination),
      dates: String(dates),
      party: String(party),
      notes: notes ? String(notes) : null,
      status: 'new',
    },
  })

  // Push in-app notification to all admins
  await createNotification({
    userId: 'all',
    userType: 'admin',
    type: 'enquiry',
    title: `New enquiry from ${name}`,
    message: `${destination} · ${dates} · ${party}`,
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
