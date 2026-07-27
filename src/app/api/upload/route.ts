// ============================================================
// Image upload — supports both local filesystem (dev) and
// Vercel Blob (production). Auto-detects based on env.
//
// - If BLOB_READ_WRITE_TOKEN is set → upload to Vercel Blob
// - Otherwise → save to /public/uploads (local dev only)
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
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

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported type: ${file.type}. Allowed: ${allowed.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate size (max 8 MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 8 MB.' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.type.split('/')[1]
    const filename = `eliya-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    // ---- Vercel Blob (production) ----
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob')
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
      })
      return NextResponse.json({ url: blob.url, size: file.size, type: file.type, stored: 'blob' })
    }

    // ---- Local filesystem (dev) ----
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    const filepath = path.join(uploadDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filepath, buffer)

    const publicUrl = `/uploads/${filename}`
    return NextResponse.json({ url: publicUrl, size: file.size, type: file.type, stored: 'local' })
  } catch (e) {
    return NextResponse.json(
      { error: 'Upload failed: ' + (e as Error).message },
      { status: 500 }
    )
  }
}
