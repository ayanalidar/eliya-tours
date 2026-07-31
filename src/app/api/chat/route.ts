// ============================================================
// AI Guide chat — OpenRouter (Llama 3.1 8B) with booking flow
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, getClientIP, rateLimitResponse, sanitizeString } from '@/lib/security'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.ZAI_API_KEY || ''
const AI_MODEL = 'meta-llama/llama-3.1-8b-instruct'

let cachedPrompt: { text: string; expires: number } | null = null
const PROMPT_CACHE_MS = 5 * 60 * 1000

const WHATSAPP_NUMBER = '917006734747'

// Check if user wants to book
function detectBookingIntent(message: string): boolean {
  const m = message.toLowerCase()
  return ['book', 'booking', 'reserve', 'plan my trip', 'plan a trip', 'i want to go', 'make a booking', 'confirm', 'enquire about', 'interested in booking'].some(k => m.includes(k))
}

// Check if user wants human handoff
function detectHandoff(message: string): boolean {
  const m = message.toLowerCase().trim()
  return ['human', 'whatsapp', 'agent', 'call', 'phone', 'real person', 'talk to someone', 'speak to'].some(k => m.includes(k))
}

// Detect if AI reply contains all booking details (name, phone, email collected)
function hasBookingData(chatHistory: Array<{ role: string; content: string }>): { hasData: boolean; guestName?: string; guestPhone?: string; guestEmail?: string } {
  // Check the last several messages for collected info
  const recentText = chatHistory.slice(-10).map(m => m.content).join(' ').toLowerCase()

  // Look for phone pattern
  const phoneMatch = recentText.match(/(\+?91[-\s]?\d{10}|\d{10})/)
  // Look for email pattern
  const emailMatch = recentText.match(/[\w.-]+@[\w.-]+\.\w+/)

  // Check if the conversation has collected name (look for "name is" or similar)
  const hasName = /name is |my name is |i am |i'm /.test(recentText)

  return {
    hasData: !!(phoneMatch && emailMatch && hasName),
    guestPhone: phoneMatch?.[0],
    guestEmail: emailMatch?.[0],
  }
}

async function buildHandoffReply(sessionId: string): Promise<string> {
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
    `Hi Eliya team, I was chatting with the AI guide Tariq and would like to speak to a human. Here is our conversation:\n\n${summary}\n\n- sent from eliyatours.in`
  )
  const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`

  return `Absolutely, let me hand you over to our human team. I've packaged our conversation so you don't have to repeat yourself.\n\nClick here to continue on WhatsApp: ${link}\n\nTariq or Imran will pick up within minutes during business hours (9am to 8pm IST).`
}

async function buildSystemPrompt(): Promise<string> {
  if (cachedPrompt && Date.now() < cachedPrompt.expires) {
    return cachedPrompt.text
  }

  const [destinations, seasons, hotels] = await Promise.all([
    db.destination.findMany({ select: { name: true, area: true, elevation: true, bestSeason: true } }),
    db.season.findMany({ select: { title: true, months: true, priceFrom: true, duration: true } }),
    db.hotel.findMany({ select: { name: true, starRating: true, priceFrom: true } }),
  ])

  const destSummary = destinations.map(d => `${d.name} (${d.area}, ${d.elevation}, ${d.bestSeason})`).join(', ')
  const seasonSummary = seasons.map(s => `${s.title} ${s.months} from Rs.${s.priceFrom} ${s.duration}`).join('; ')
  const hotelSummary = hotels.map(h => `${h.name} ${h.starRating}star Rs.${h.priceFrom}/night`).join('; ')

  const prompt = `You are Tariq, a Kashmiri tour guide from Eliya Tours (since 2009). Be warm, brief and helpful. Reply in under 150 words.

Destinations: ${destSummary}
Seasons: ${seasonSummary}
Hotels: ${hotelSummary}

BOOKING FLOW — When a guest wants to book, follow these steps ONE AT A TIME:
1. Ask for their name, phone number, and email (if not already provided)
2. Ask their budget per person
3. Ask which destinations they want to visit (suggest from the list above)
4. Ask hotel preference (suggest from the list above)
5. Ask car preference (Innova, Thar, Scorpio, Urbania, Amaze, Jeep)
6. Ask travel dates
7. Summarize everything and ask "Shall I submit this booking request?"
8. When they confirm, say: "BOOKING_SUBMIT" (this triggers the system to send it to our team)

IMPORTANT: If the user says they want to book, collect details step by step. Don't ask everything at once. After collecting all details, suggest the best matching seasonal package from the list.

If unsure about anything, say "Let me check with the team." Match the user's language (English/Hindi/Urdu). End with a clear next step. Contact: +91-7006734747, hello@eliyatours.in`

  cachedPrompt = { text: prompt, expires: Date.now() + PROMPT_CACHE_MS }
  return prompt
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req)
  const rl = rateLimit(`chat:${ip}`, 30, 60 * 60 * 1000)
  if (!rl.allowed) {
    return rateLimitResponse(rl.resetAt)
  }

  const body = await req.json().catch(() => ({}))
  const { message, history = [], sessionId = 'anon' } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  const cleanMessage = sanitizeString(message, 2000)
  if (!cleanMessage) {
    return NextResponse.json({ error: 'message cannot be empty' }, { status: 400 })
  }

  // Log the user message
  try {
    await db.chatLog.create({
      data: { sessionId, role: 'user', content: cleanMessage.slice(0, 4000) },
    })
  } catch {}

  // Handoff to human
  if (detectHandoff(cleanMessage)) {
    const reply = await buildHandoffReply(sessionId)
    try {
      await db.chatLog.create({ data: { sessionId, role: 'assistant', content: String(reply).slice(0, 4000) } })
    } catch {}
    return NextResponse.json({ reply, sessionId, handoff: true })
  }

  // Build system prompt
  const systemPrompt = await buildSystemPrompt()

  // Check if guest is logged in (pass guest info to AI if available)
  const GUEST_COOKIE = 'eliya_guest_session'
  let guestInfo = ''
  const guestToken = req.cookies.get(GUEST_COOKIE)?.value
  if (guestToken) {
    try {
      const decoded = Buffer.from(guestToken, 'base64').toString('utf-8')
      const [guestId] = decoded.split('|')
      const guest = await db.guest.findUnique({ where: { id: guestId } })
      if (guest) {
        guestInfo = `\n\nGUEST IS LOGGED IN: Name: ${guest.name}, Email: ${guest.email}, Phone: ${guest.phone || 'not provided'}. You can use these details for booking — no need to ask again.`
      }
    } catch {}
  }

  // Compose messages
  const recentHistory = (Array.isArray(history) ? history : []).slice(-8)
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt + guestInfo },
    ...recentHistory.map((h: { role: string; content: string }) => ({
      role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
      content: sanitizeString(String(h.content), 4000),
    })),
    { role: 'user', content: cleanMessage.slice(0, 4000) },
  ]

  try {
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
    let reply = response.choices?.[0]?.message?.content || 'I apologize, I could not generate a reply. Please call us at +91-7006734747.'

    // Check if AI triggered booking submission
    if (reply.includes('BOOKING_SUBMIT')) {
      // Fetch chat history to extract booking details
      const allLogs = await db.chatLog.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: 20,
      })
      const chatText = allLogs.map(l => `${l.role}: ${l.content}`).join('\n')

      // Extract details from chat using regex
      const phoneMatch = chatText.match(/(\+?91[-\s]?\d{10}|\d{10})/)
      const emailMatch = chatText.match(/[\w.-]+@[\w.-]+\.\w+/)
      const nameMatch = chatText.match(/(?:name is |my name is |i am |i'm )([\w\s]{2,30})/i)

      const guestName = nameMatch?.[1]?.trim() || 'AI Chat Guest'
      const guestPhone = phoneMatch?.[0] || 'Not collected'
      const guestEmail = emailMatch?.[0] || 'not@provided.com'

      // Submit enquiry to admin
      try {
        await db.enquiry.create({
          data: {
            name: guestName,
            email: guestEmail,
            phone: guestPhone,
            destination: 'AI Booking Request — see notes',
            dates: 'See notes',
            party: 'See notes',
            notes: `BOOKING VIA AI GUIDE (Session: ${sessionId})\n\nFull chat transcript:\n${chatText.slice(0, 3000)}`,
            status: 'new',
          },
        })

        // Create notification
        await db.notification.createMany({
          data: (await db.adminUser.findMany({ where: { active: true }, select: { id: true } })).map(u => ({
            userId: u.id,
            userType: 'admin',
            type: 'booking',
            title: `AI Booking Request from ${guestName}`,
            message: `Phone: ${guestPhone} — Call for official confirmation`,
            link: '#/admin',
            read: false,
          })),
        })
      } catch {}

      // Replace BOOKING_SUBMIT with confirmation message
      reply = `Excellent! I've submitted your booking request to our team.\n\nHere's what happens next:\n1. Our team will review your preferences\n2. You'll receive a call on ${guestPhone} within 1 hour for official confirmation\n3. We'll finalize the itinerary, pricing, and payment details on the call\n\nYour reference: AI-${sessionId.slice(-6).toUpperCase()}\n\nFor immediate assistance, WhatsApp us: +91-7006734747`
    }

    // Log the assistant reply
    try {
      await db.chatLog.create({
        data: { sessionId, role: 'assistant', content: String(reply).slice(0, 4000) },
      })
    } catch {}

    return NextResponse.json({ reply, sessionId })
  } catch (e) {
    console.error('AI chat error:', e)
    return NextResponse.json(
      {
        reply: "I'm having trouble connecting right now. Please WhatsApp us at +91-7006734747 — our team will reply within minutes.",
        error: (e as Error).message,
      },
      { status: 500 }
    )
  }
}
