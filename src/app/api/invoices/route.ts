// ============================================================
// Invoices API — list/get/create/update (admin only)
// ============================================================
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

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token) return false
  const session = parseToken(token)
  if (!session) return false
  const user = await db.adminUser.findUnique({ where: { id: session.userId } })
  return !!user && user.active
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')

  if (id) {
    const inv = await db.invoice.findUnique({ where: { id } })
    if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ invoice: inv })
  }

  const invoices = await db.invoice.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  return NextResponse.json({ invoices })
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))

  // Auto-generate invoice number: ELI-YYYY-NNNN
  const year = new Date().getFullYear()
  const count = await db.invoice.count()
  const number = `ELI-${year}-${String(count + 1).padStart(4, '0')}`

  const amount = Number(body.amount) || 0
  const discountPct = Number(body.discountPct) || 0
  const taxPct = Number(body.taxPct) || 5
  const discounted = amount * (1 - discountPct / 100)
  const totalAmount = Math.round(discounted * (1 + taxPct / 100))

  const invoice = await db.invoice.create({
    data: {
      number,
      clientName: String(body.clientName || ''),
      clientEmail: body.clientEmail ? String(body.clientEmail) : null,
      clientPhone: body.clientPhone ? String(body.clientPhone) : null,
      packageName: body.packageName ? String(body.packageName) : null,
      amount,
      discountPct,
      taxPct,
      totalAmount,
      status: String(body.status || 'draft'),
      issuedBy: String(body.issuedBy || ''),
    },
  })
  return NextResponse.json({ invoice })
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined) {
      if (['amount', 'discountPct', 'taxPct', 'totalAmount'].includes(k)) data[k] = Number(v)
      else data[k] = v
    }
  }

  // Recompute totalAmount if amount/discount/tax changed
  if ('amount' in data || 'discountPct' in data || 'taxPct' in data) {
    const current = await db.invoice.findUnique({ where: { id: String(id) } })
    if (current) {
      const amt = Number(data.amount ?? current.amount)
      const dpct = Number(data.discountPct ?? current.discountPct)
      const tpct = Number(data.taxPct ?? current.taxPct)
      data.totalAmount = Math.round(amt * (1 - dpct / 100) * (1 + tpct / 100))
    }
  }

  const invoice = await db.invoice.update({ where: { id: String(id) }, data })
  return NextResponse.json({ invoice })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await db.invoice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
