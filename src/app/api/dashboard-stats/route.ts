// Single API that returns all dashboard counts in ONE request
// instead of the client making 9 separate API calls
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

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const session = parseToken(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await db.adminUser.findUnique({ where: { id: session.userId } })
  if (!user || !user.active) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Run all counts in parallel (single round-trip to DB)
  const [
    enquiries, newEnquiries, destinations, seasons, hotels,
    invoices, bookings, adventures, offers, reviews, pendingReviews
  ] = await Promise.all([
    db.enquiry.count(),
    db.enquiry.count({ where: { status: 'new' } }),
    db.destination.count(),
    db.season.count(),
    db.hotel.count(),
    db.invoice.count(),
    db.booking.count(),
    db.adventureSport.count(),
    db.offer.count({ where: { active: true } }),
    db.review.count(),
    db.review.count({ where: { approved: false } }),
  ])

  return NextResponse.json({
    enquiries, newEnquiries, destinations, seasons, hotels,
    invoices, bookings, adventures, offers, reviews, pendingReviews,
  })
}
