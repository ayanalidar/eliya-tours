// ============================================================
// Security utilities — rate limiting, input sanitization, CORS
// ============================================================
import { NextRequest, NextResponse } from 'next/server'

// ---------- In-memory rate limiter ----------
// Note: On Vercel serverless, this is per-instance. For production
// scale, use Upstash Redis or Vercel KV. For now, this blocks
// the most common brute-force attacks.

type RateLimitEntry = { count: number; resetAt: number; blocked: boolean }
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) rateLimitStore.delete(key)
    }
  }, 5 * 60 * 1000).unref?.()
}

export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs, blocked: false })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  entry.count++
  const allowed = entry.count <= maxRequests
  return {
    allowed,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt,
  }
}

// Get client IP (works behind Vercel proxy)
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

// Rate limit response helper
export function rateLimitResponse(resetAt: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        'X-RateLimit-Reset': String(resetAt),
      },
    }
  )
}

// ---------- Input sanitization ----------
// Strip HTML tags and dangerous characters from user input
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return ''
  return input
    .slice(0, maxLength)
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '') // Remove on* event handlers
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/<[^>]+>/g, '') // Strip all HTML tags (we render as text)
    .trim()
}

// Sanitize email
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''
  return email.toLowerCase().trim().slice(0, 254)
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

// Validate PIN (6 digits)
export function isValidPin(pin: string): boolean {
  return /^\d{6}$/.test(pin)
}

// Validate rating (1-5)
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5
}

// ---------- CORS ----------
// Allow same-origin only. Vercel serves the frontend + API on the same domain.
export function applyCorsHeaders(res: NextResponse): NextResponse {
  res.headers.set('Access-Control-Allow-Origin', 'same-origin')
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Max-Age', '86400')
  return res
}

// Handle OPTIONS preflight
export function handleOptions(): NextResponse {
  const res = new NextResponse(null, { status: 204 })
  return applyCorsHeaders(res)
}

// ---------- Review sanitization for public API ----------
// Remove guest email from public review responses (PII protection)
export function sanitizeReviewForPublic(review: Record<string, unknown>): Record<string, unknown> {
  const { guestEmail, ...publicFields } = review
  return publicFields
}
