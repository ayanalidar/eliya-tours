// ============================================================
// AI Guide chat — uses z-ai-web-dev-sdk LLM
// POST /api/chat { message, history, sessionId }
//
// The agent acts as Eliya's local Kashmir guide. It knows all
// destinations, seasons and packages from the DB. It can also
// compose new package suggestions on request.
//
// Special commands:
//   "human" / "whatsapp" / "agent" — generate WhatsApp handoff link
//   with chat history
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'
import { rateLimit, getClientIP, rateLimitResponse, sanitizeString } from '@/lib/security'

const WHATSAPP_NUMBER = '919419012345'

function detectHandoff(message: string): boolean {
  const m = message.toLowerCase().trim()
  return ['human', 'whatsapp', 'agent', 'call', 'phone', 'real person', 'talk to someone', 'speak to'].some((k) => m.includes(k))
}

async function buildHandoffReply(sessionId: string, userName?: string): Promise<string> {
  // Fetch last 8 chat messages to include in WhatsApp
  const logs = await db.chatLog.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })
  logs.reverse()

  const summary = logs
    .map((l) => `${l.role === 'user' ? 'Guest' : 'Tariq'}: ${l.content.slice(0, 200)}`)
    .join('\n')

  const text = encodeURIComponent(
    `Hi Eliya team, I was chatting with the AI guide Tariq and would like to speak to a human. My name is ${userName || '[your name]'}. Here is our conversation so far:\n\n${summary}\n\n— sent from eliyatours.in`
  )
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`

  return `Absolutely — let me hand you over to our human team. I've packaged our conversation so you don't have to repeat yourself.\n\n👉 Click here to continue on WhatsApp: ${link}\n\nTariq or Imran will pick up within minutes during business hours (9am–8pm IST). If it's outside those hours, they'll reply first thing in the morning.`
}

// Build the system prompt — includes the live DB content so the
// model always answers from current Eliya data.
async function buildSystemPrompt(): Promise<string> {
  const [destinations, seasons, hotels] = await Promise.all([
    db.destination.findMany({ select: { id: true, name: true, area: true, region: true, elevation: true, bestSeason: true, tagline: true, description: true, longDescription: true, highlights: true, latitude: true, longitude: true } }),
    db.season.findMany({ select: { id: true, season: true, months: true, title: true, theme: true, description: true, longDescription: true, priceFrom: true, duration: true, destinations: true, itinerary: true } }),
    db.hotel.findMany({ select: { id: true, name: true, destinationId: true, type: true, starRating: true, description: true, priceFrom: true, amenities: true } }),
  ])

  const destSummary = destinations
    .map((d) => `  - ${d.name} (${d.area}, ${d.region}, ${d.elevation}, best: ${d.bestSeason}) — ${d.tagline}. ${d.description}`)
    .join('\n')

  const seasonSummary = seasons
    .map((s) => `  - ${s.title} (${s.season}, ${s.months}, from ₹${s.priceFrom}, ${s.duration}) — ${s.theme}. ${s.description}`)
    .join('\n')

  const hotelSummary = hotels
    .map((h) => `  - ${h.name} (${h.type}, ${h.starRating}★, from ₹${h.priceFrom}/night, destination: ${h.destinationId}) — ${h.description}`)
    .join('\n')

  return `You are the Eliya Tours And Travels AI guide — a knowledgeable Kashmiri local named Tariq who has been running tours in Kashmir and Ladakh since 2009. You are warm, specific, and never make things up. Your SOLE PURPOSE is to help guests understand Eliya's packages and Kashmir/Ladakh destinations, and to design custom packages on request.

Always answer as Tariq — first-person, friendly, with concrete details from the data below. If a guest asks about a destination you don't have in the data, say you don't have a curated package there yet but offer the closest alternative. If asked to design a custom package, always include: day-by-day plan, estimated price in INR per person (based on the prices in the data), best season, and which Eliya destinations are included.

CURRENT ELIYA DATA:

DESTINATIONS (always reference these — do not invent new ones):
${destSummary}

SEASONAL PACKAGES:
${seasonSummary}

HOTELS:
${hotelSummary}

RULES:
1. Never invent destinations, prices, or facts not in the data above. If unsure, say "Let me check with the team in Srinagar and reply by email."
2. When recommending a package, mention its name, duration, price-from, and what's included.
3. When designing a custom package, structure it as Day 1 / Day 2 / etc., with destination, activity, and rough cost.
4. Keep replies under 250 words unless the guest specifically asks for more detail.
5. LANGUAGE: Always reply in the same language the user writes in. If they write Hindi (Devanagari or Roman), reply in Hindi. If Urdu, reply in Urdu. If English, reply in English. Match their script and tone.
6. Always end with a clear next step: "Shall I send you a draft itinerary over WhatsApp?" or "Would you like me to book this?" — but never claim to actually book.
7. If asked about safety, weather, or permits, be specific to the destination's data.
8. If the user asks to speak to a human, says "human", "whatsapp", "agent", or similar — tell them you'll hand them over and the system will provide a WhatsApp link automatically.
9. Company contact: +91 94190 12345 (WhatsApp/call), hello@eliyatours.in.`
}

export async function POST(req: NextRequest) {
  // Rate limit: 20 messages per IP per hour (cost abuse protection)
  const ip = getClientIP(req)
  const rl = rateLimit(`chat:${ip}`, 20, 60 * 60 * 1000)
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt)
  }

  const body = await req.json().catch(() => ({}))
  const { message, history = [], sessionId = 'anon' } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  // Sanitize the message (XSS protection — message goes into LLM prompt + is stored)
  const cleanMessage = sanitizeString(message, 2000)
  if (!cleanMessage) {
    return NextResponse.json({ error: 'message cannot be empty' }, { status: 400 })
  }

  // Log the user message (sanitized)
  try {
    await db.chatLog.create({
      data: { sessionId, role: 'user', content: cleanMessage.slice(0, 4000) },
    })
  } catch {
    // ignore log errors
  }

  // Live chat handoff: if user asks for human/whatsapp, generate handoff link
  if (detectHandoff(cleanMessage)) {
    const reply = await buildHandoffReply(sessionId)
    try {
      await db.chatLog.create({
        data: { sessionId, role: 'assistant', content: String(reply).slice(0, 4000) },
      })
    } catch {
      // ignore
    }
    return NextResponse.json({ reply, sessionId, handoff: true })
  }

  // Build system prompt with live DB context
  const systemPrompt = await buildSystemPrompt()

  // Compose message array — last 8 turns for context
  const recentHistory = (Array.isArray(history) ? history : []).slice(-8)
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map((h: { role: string; content: string }) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: sanitizeString(String(h.content), 4000),
    })),
    { role: 'user', content: cleanMessage.slice(0, 4000) },
  ]

  try {
    // Pass API key explicitly — on Vercel, the ZAI SDK can't find .z-ai-config
    const apiKey = process.env.ZAI_API_KEY
    if (!apiKey) {
      throw new Error('ZAI_API_KEY environment variable is not set')
    }
    const zai = await ZAI.create({ apiKey })
    const response = await zai.chat.completions.create({
      model: 'glm-4.6',
      messages,
      temperature: 0.7,
      max_tokens: 900,
      thinking: { type: 'disabled' },
    })

    const reply = response.choices?.[0]?.message?.content || 'I apologize — I could not generate a reply. Please try again or call us at +91 94190 12345.'

    // Log the assistant reply
    try {
      await db.chatLog.create({
        data: { sessionId, role: 'assistant', content: String(reply).slice(0, 4000) },
      })
    } catch {
      // ignore
    }

    return NextResponse.json({ reply, sessionId })
  } catch (e) {
    console.error('AI chat error:', e)
    return NextResponse.json(
      {
        reply:
          "I'm having trouble connecting right now. Please WhatsApp us at +91 94190 12345 — Tariq or Imran will reply within minutes during business hours.",
        error: (e as Error).message,
      },
      { status: 500 }
    )
  }
}
