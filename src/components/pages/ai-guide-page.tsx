'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles, Loader2, User, Bot, ArrowLeft, MessageCircle, Phone } from 'lucide-react'
import { useNav } from '@/lib/router'

// ============================================================
// AI Guide Chat page · Tariq, the local Kashmir guide
// Uses /api/chat which calls z-ai-web-dev-sdk LLM with live
// DB context (destinations, seasons, hotels, packages)
// ============================================================

type Message = { role: 'user' | 'assistant'; content: string; ts: number }

const SUGGESTED = [
  'What\'s the best 7-day Kashmir itinerary for first-timers?',
  'I want to ski Gulmarg in February · what should I pack?',
  'Design a 10-day Ladakh trip including Pangong and Nubra.',
  'We\'re a family of 4 with 2 kids. What do you recommend?',
  'When is the saffron harvest in Pampore?',
  'What\'s your most romantic houseboat for a honeymoon?',
]

export function AIGuidePage() {
  const nav = useNav()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Assalam-u-alaikum, I'm Tariq · your local Kashmir guide from Eliya Tours. I've been running trips in Kashmir and Ladakh since 2009. Ask me about any destination, season, hotel, or package · or tell me what you're dreaming of and I'll design a custom itinerary for you. How can I help?",
      ts: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim(), ts: Date.now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: newMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      })
      const data = await r.json()
      const reply =
        data.reply ||
        "I apologize · I couldn't generate a reply. Please WhatsApp us at +91-7006734747."
      setMessages((m) => [...m, { role: 'assistant', content: reply, ts: Date.now() }])
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please WhatsApp us at +91-7006734747 · Tariq or Imran will reply within minutes.",
          ts: Date.now(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <header className="bg-stone-950 text-amber-50 sticky top-0 z-30">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => nav({ name: 'home' })}
            className="grid place-items-center w-9 h-9 rounded-full hover:bg-stone-800 transition-colors"
            aria-label="Back home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <span className="relative grid place-items-center w-11 h-11 rounded-full bg-amber-50/10 ring-1 ring-amber-50/20">
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full ring-2 ring-stone-950" />
            </span>
            <div>
              <h1 className="text-base font-semibold">Tariq · Eliya AI Guide</h1>
              <p className="text-[11px] text-amber-200/70">Local Kashmir guide · online now</p>
            </div>
          </div>
          <a
            href="https://wa.me/917006734747"
            target="_blank"
            rel="noopener noreferrer"
            className="grid place-items-center w-9 h-9 rounded-full bg-green-500/15 hover:bg-green-500/25 text-green-300 transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <a
            href="tel:+917006734747"
            className="grid place-items-center w-9 h-9 rounded-full bg-amber-50/10 hover:bg-amber-50/20 text-amber-50 transition-colors"
            aria-label="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="grid place-items-center w-8 h-8 rounded-full bg-stone-950 text-amber-50 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white ring-1 ring-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-stone-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Tariq is typing…</span>
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="pt-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500 font-medium mb-3">
                Try one of these
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-sm px-4 py-3 rounded-xl bg-white ring-1 ring-stone-200 hover:ring-stone-400 text-stone-700 hover:bg-stone-50 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-stone-100 border-t border-stone-200 px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 bg-white rounded-2xl ring-1 ring-stone-300 focus-within:ring-2 focus-within:ring-stone-400 transition-all p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask Tariq about Kashmir, Ladakh, packages, or design a custom trip…"
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none max-h-32"
              style={{ minHeight: '40px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="grid place-items-center w-10 h-10 rounded-xl bg-stone-900 text-amber-50 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-900 transition-colors shrink-0"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-2 text-[10px] text-stone-400 text-center">
            Tariq answers from Eliya&apos;s live destination, season and hotel data. He won&apos;t make things up.
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`grid place-items-center w-8 h-8 rounded-full shrink-0 ${
          isUser ? 'bg-stone-300 text-stone-700' : 'bg-stone-950 text-amber-50'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-stone-900 text-amber-50 rounded-tr-sm'
            : 'bg-white ring-1 ring-stone-200 text-stone-800 rounded-tl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
