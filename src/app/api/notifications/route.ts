// ============================================================
// Notifications API — admin or guest user notifications
// GET /api/notifications?userType=admin — list (uses cookie session)
// PATCH /api/notifications?id=... — mark read
// POST /api/notifications/mark-all — mark all read
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

async function getCurrentUser(req: NextRequest): Promise<{ id: string; type: 'admin' | 'guest' } | null> {
  const adminToken = req.cookies.get(SESSION_COOKIE)?.value
  if (adminToken) {
    const s = parseToken(adminToken)
    if (s) {
      const u = await db.adminUser.findUnique({ where: { id: s.userId } })
      if (u && u.active) return { id: u.id, type: 'admin' }
    }
  }
  const guestToken = req.cookies.get(GUEST_COOKIE)?.value
  if (guestToken) {
    const s = parseToken(guestToken)
    if (s) {
      const g = await db.guest.findUnique({ where: { id: s.userId } })
      if (g) return { id: g.id, type: 'guest' }
    }
  }
  return null
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 })

  const url = new URL(req.url)
  const onlyUnread = url.searchParams.get('unread') === 'true'
  const limit = Number(url.searchParams.get('limit')) || 50

  const where: Record<string, unknown> = {
    userId: user.id,
    userType: user.type,
  }
  if (onlyUnread) where.read = false

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit }),
    db.notification.count({ where: { userId: user.id, userType: user.type, read: false } }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { id, read } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Ensure notification belongs to this user
  const notif = await db.notification.findUnique({ where: { id: String(id) } })
  if (!notif || notif.userId !== user.id || notif.userType !== user.type) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await db.notification.update({
    where: { id: String(id) },
    data: { read: read !== undefined ? Boolean(read) : true },
  })
  return NextResponse.json({ notification: updated })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  if (body.markAll) {
    await db.notification.updateMany({
      where: { userId: user.id, userType: user.type, read: false },
      data: { read: true },
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
