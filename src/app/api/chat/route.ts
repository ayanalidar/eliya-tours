// ============================================================
// AI Guide chat · uses z-ai-web-dev-sdk LLM
// POST /api/chat { message, history, sessionId }
//
// The agent acts as Eliya's local Kashmir guide. It knows all
// destinations, seasons and packages from the DB. It can also
// compose new package suggestions on request.
//
// Special commands:
//   "human" / "whatsapp" / "agent" · generate WhatsApp handoff link
//   with chat history
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIP, rateLimitResponse, sanitizeString } from '@/lib/security'

// OpenRouter API config — using fast model for quick responses
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.ZAI_API_KEY || ''
// Use Llama 3.1 8B — 10x faster than 70B, still smart enough for a tour guide
const AI_MODEL = 'meta-llama/llama-3.1-8b-instruct'

// Cache the system prompt for 5 minutes (avoid DB queries on every message)
let cachedPrompt: { text: string; expires: number } | null = null
const PROMPT_CACHE_MS = 5 * 60 * 1000

const WHATSAPP_NUMBER = '917006734747'

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
    `Hi Eliya team, I was chatting with the AI guide Tariq and would like to speak to a human. My name is ${userName || '[your name]'}. Here is our conversation so far:\n\n${summary}\n\n· sent from eliyatours.in`
  )
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`

  return `Absolutely · let me hand you over to our human team. I've packaged our conversation so you don't have to repeat yourself.\n\n👉 Click here to continue on WhatsApp: ${link}\n\nTariq or Imran will pick up within minutes during business hours (9am–8pm IST). If it's outside those hours, they'll reply first thing in the morning.`
}

// Build the system prompt · includes the live DB content so the
// model always answers from current Eliya data.
async function buildSystemPrompt(): Promise<string> {
  // Return cached prompt if still fresh (avoids DB queries on every message)
  if (cachedPrompt && Date.now() < cachedPrompt.expires) {
    return cachedPrompt.text
  }

  const [destinations, seasons, hotels] = await Promise.all([
    db.destination.findMany({ select: { name: true, area: true, elevation: true, bestSeason: true } }),
    db.season.findMany({ select: { title: true, months: true, priceFrom: true, duration: true } }),
    db.hotel.findMany({ select: { name: true, starRating: true, priceFrom: true } }),
  ])

  // Keep summaries SHORT — fewer tokens = faster response
  const destSummary = destinations.map(d => `${d.name} (${d.area}, ${d.elevation}, ${d.bestSeason})`).join(', ')
  const seasonSummary = seasons.map(s => `${s.title} ${s.months} from Rs.${s.priceFrom} ${s.duration}`).join('; ')
  const hotelSummary = hotels.map(h => `${h.name} ${h.starRating}star Rs.${h.priceFrom}/night`).join('; ')

  const prompt = `You are Tariq, a Kashmiri tour guide from Eliya Tours (since 2009). Be warm, brief and helpful. Reply in under 150 words.

Destinations: ${destSummary}
Seasons: ${seasonSummary}
Hotels: ${hotelSummary}

Rules: Never invent facts. If unsure, say "Let me check with the team." For custom trips, give a brief day-by-day plan with rough cost. Match the user's language (English/Hindi/Urdu). End with a next step. Contact: +91-7006734747, hello@eliyatours.in`

  cachedPrompt = { text: prompt, expires: Date.now() + PROMPT_CACHE_MS }
  return prompt
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

  // Sanitize the message (XSS protection · message goes into LLM prompt + is stored)
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

  // Compose message array · last 8 turns for context
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
    // Direct API call to OpenRouter (free Llama 3.3 70B model)
    const apiResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://eliya-tours.vercel.app',
        'X-Title': 'Eliya Tours AI Guide',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 400,
      }),
    })

    if (!apiResponse.ok) {
      const errText = await apiResponse.text()
      throw new Error(`AI API ${apiResponse.status}: ${errText.slice(0, 200)}`)
    }

    const response = await apiResponse.json()
    const reply = response.choices?.[0]?.message?.content || 'I apologize · I could not generate a reply. Please try again or call us at +91-7006734747.'

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
          "I'm having trouble connecting right now. Please WhatsApp us at +91-7006734747 · Tariq or Imran will reply within minutes during business hours.",
        error: (e as Error).message,
      },
      { status: 500 }
    )
  }
}
