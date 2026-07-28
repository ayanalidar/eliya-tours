// ============================================================
// Bookings API · online booking + payment
// POST /api/bookings · create booking (public)
// GET /api/bookings · list (admin or guest-self)
// PATCH /api/bookings · update payment status
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notify'
import { rateLimit, getClientIP, rateLimitResponse, sanitizeString, sanitizeEmail, isValidEmail } from '@/lib/security'

const SESSION_COOKIE = 'eliya_admin_session'
const GUEST_COOKIE = 'eliya_guest_session'

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

async function isGuest(req: NextRequest) {
  const token = req.cookies.get(GUEST_COOKIE)?.value
  if (!token) return null
  const session = parseToken(token)
  if (!session) return null
  const guest = await db.guest.findUnique({ where: { id: session.userId } })
  return guest
}

// Validate an offer code and return discount %
async function validateOfferCode(code: string): Promise<{ valid: boolean; discountPct: number; title?: string }> {
  const offer = await db.offer.findUnique({ where: { code } })
  if (!offer || !offer.active) return { valid: false, discountPct: 0 }
  const now = new Date()
  if (now < offer.validFrom || now > offer.validTo) return { valid: false, discountPct: 0 }
  return { valid: true, discountPct: offer.discountPct, title: offer.title }
}

export async function POST(req: NextRequest) {
  // Rate limit: 3 bookings per IP per hour (abuse protection)
  const ip = getClientIP(req)
  const rl = rateLimit(`booking:${ip}`, 3, 60 * 60 * 1000)
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt)
  }

  const body = await req.json().catch(() => ({}))
  const {
    guestName, guestEmail, guestPhone, packageName, destinationIds,
    startDate, endDate, party, baseAmount, discountCode, taxPct = 5,
    paymentMethod, currency = 'INR',
  } = body

  if (!guestName || !guestEmail || !guestPhone || !packageName || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Validate + sanitize inputs
  const cleanEmail = sanitizeEmail(String(guestEmail))
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }
  const cleanName = sanitizeString(String(guestName), 100)
  const cleanPhone = sanitizeString(String(guestPhone), 20)
  const cleanPackage = sanitizeString(String(packageName), 200)
  if (!cleanName || !cleanPhone || !cleanPackage) {
    return NextResponse.json({ error: 'Fields cannot be empty' }, { status: 400 })
  }

  // Validate offer if provided
  let discountPct = 0
  if (discountCode) {
    const offer = await validateOfferCode(String(discountCode).toUpperCase())
    if (!offer.valid) {
      return NextResponse.json({ error: `Invalid or expired code: ${discountCode}` }, { status: 400 })
    }
    discountPct = offer.discountPct
  }

  const base = Number(baseAmount) || 0
  const discounted = base * (1 - discountPct / 100)
  const tax = Number(taxPct) || 5
  const totalAmount = Math.round(discounted * (1 + tax / 100))

  // Generate reference: ELI-BKG-XXXXX
  const count = await db.booking.count()
  const reference = `ELI-BKG-${String(count + 1001).padStart(5, '0')}`

  // Try to find or create guest
  let guestId: string | null = null
  const existingGuest = await db.guest.findUnique({ where: { email: cleanEmail } })
  if (existingGuest) guestId = existingGuest.id

  const booking = await db.booking.create({
    data: {
      reference,
      guestId,
      guestName: cleanName,
      guestEmail: cleanEmail,
      guestPhone: cleanPhone,
      packageName: cleanPackage,
      destinationIds: JSON.stringify(destinationIds || []),
      startDate: sanitizeString(String(startDate), 20),
      endDate: sanitizeString(String(endDate), 20),
      party: sanitizeString(String(party || ''), 100),
      baseAmount: base,
      discountPct,
      discountCode: discountCode ? sanitizeString(String(discountCode).toUpperCase(), 50) : null,
      taxPct: tax,
      totalAmount,
      currency: String(currency),
      paidAmount: 0,
      paymentStatus: 'pending',
      paymentMethod: paymentMethod ? String(paymentMethod) : null,
      status: 'confirmed',
    },
  })

  // Notify admins
  await createNotification({
    userId: 'all',
    userType: 'admin',
    type: 'booking',
    title: `New booking ${reference}`,
    message: `${guestName} booked ${packageName} · ₹${totalAmount.toLocaleString('en-IN')}`,
    link: '#/admin',
  })

  return NextResponse.json({ booking })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const reference = url.searchParams.get('reference')

  // If guest is asking for their own booking by reference, allow
  if (reference) {
    const booking = await db.booking.findUnique({ where: { reference } })
    if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ booking })
  }

  // Otherwise admin only
  if (!(await isAdmin(req))) {
    // Allow guest to see their own bookings
    const guest = await isGuest(req)
    if (!guest) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const bookings = await db.booking.findMany({
      where: { guestEmail: guest.email },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ bookings })
  }

  const bookings = await db.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  return NextResponse.json({ bookings })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { id, paymentStatus, paidAmount, paymentRef, status } = body

  // Admin OR guest updating their own booking by reference
  const admin = await isAdmin(req)
  const guest = await isGuest(req)

  if (!admin && !guest) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const existing = await db.booking.findUnique({ where: { id: String(id) } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (guest && existing.guestEmail !== guest.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data: Record<string, unknown> = {}
  if (paymentStatus !== undefined) data.paymentStatus = String(paymentStatus)
  if (paidAmount !== undefined) data.paidAmount = Number(paidAmount)
  if (paymentRef !== undefined) data.paymentRef = String(paymentRef)
  if (status !== undefined) data.status = String(status)

  const booking = await db.booking.update({ where: { id: String(id) }, data })

  // Notify on payment success
  if (paymentStatus === 'paid' && existing.paymentStatus !== 'paid') {
    await createNotification({
      userId: 'all',
      userType: 'admin',
      type: 'booking',
      title: `Payment received: ${existing.reference}`,
      message: `₹${Number(booking.totalAmount).toLocaleString('en-IN')} via ${booking.paymentMethod || 'bank'}`,
      link: '#/admin',
    })
  }

  return NextResponse.json({ booking })
}
