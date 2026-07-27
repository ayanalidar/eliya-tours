// ============================================================
// Notification helper — used by all APIs to push notifications
// to admin or guest users.
// ============================================================
import { db } from '@/lib/db'

export async function createNotification({
  userId,
  userType,
  type,
  title,
  message,
  link,
}: {
  userId: string // 'all' for broadcast to all of userType
  userType: 'admin' | 'guest'
  type: string // enquiry, booking, review, weather, system
  title: string
  message: string
  link?: string
}) {
  try {
    if (userId === 'all') {
      // Broadcast to all users of this type
      const users = userType === 'admin'
        ? await db.adminUser.findMany({ where: { active: true }, select: { id: true } })
        : await db.guest.findMany({ select: { id: true } })

      const records = users.map((u) => ({
        userId: u.id,
        userType,
        type,
        title,
        message,
        link: link || null,
        read: false,
      }))

      await db.notification.createMany({ data: records })
      return records.length
    } else {
      await db.notification.create({
        data: { userId, userType, type, title, message, link: link || null, read: false },
      })
      return 1
    }
  } catch (e) {
    console.error('Notification create failed:', e)
    return 0
  }
}
