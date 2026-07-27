// ============================================================
// Reviews API
// GET /api/reviews?destinationId=...&approved=true
// POST — public submission (creates as unapproved)
// PATCH — admin approve/reply
// DELETE — admin
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

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const destinationId = url.searchParams.get('destinationId')
  const hotelId = url.searchParams.get('hotelId')
  const onlyApproved = url.searchParams.get('approved') === 'true'

  const where: Record<string, unknown> = {}
  if (destinationId) where.destinationId = destinationId
  if (hotelId) where.hotelId = hotelId
  if (onlyApproved) where.approved = true

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ reviews })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { guestName, guestEmail, rating, title, body: reviewBody, destinationId, hotelId, packageName, tripDate } = body

  if (!guestName || !guestEmail || !rating || !title || !reviewBody) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const r = Number(rating)
  if (r < 1 || r > 5) {
    return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
  }

  const review = await db.review.create({
    data: {
      guestName: String(guestName),
      guestEmail: String(guestEmail),
      rating: r,
      title: String(title),
      body: String(reviewBody),
      destinationId: destinationId ? String(destinationId) : null,
      hotelId: hotelId ? String(hotelId) : null,
      packageName: packageName ? String(packageName) : null,
      tripDate: tripDate ? String(tripDate) : null,
      approved: false,
      verified: false,
    },
  })

  // Notify all admins
  await createNotification({
    userId: 'all',
    userType: 'admin',
    type: 'review',
    title: `New review from ${guestName}`,
    message: `"${title}" — ${r}★ awaiting approval`,
    link: '#/admin',
  })

  return NextResponse.json({ ok: true, id: review.id })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, approved, reply, verified } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (approved !== undefined) data.approved = Boolean(approved)
  if (reply !== undefined) data.reply = String(reply)
  if (verified !== undefined) data.verified = Boolean(verified)

  const review = await db.review.update({ where: { id: String(id) }, data })
  return NextResponse.json({ review })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.review.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
