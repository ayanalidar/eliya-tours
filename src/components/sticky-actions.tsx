'use client'

import { useEffect, useState } from 'react'
import { Phone, MessageCircle, X } from 'lucide-react'

// ============================================================
// Sticky WhatsApp + Call action buttons
// Fixed bottom-right, with expandable tooltip on mobile
// ============================================================

const WHATSAPP_NUMBER = '917006734747'
const PHONE_NUMBER = '+917006734747'
const DISPLAY_PHONE = '+91-7006734747'

const PRESET_MESSAGES = [
  'Hi Eliya, I\'d like a quote for a Kashmir trip.',
  'What\'s the best season for Gulmarg skiing?',
  'Can you design a 7-day Ladakh itinerary?',
  'I want to book the Houseboat Heritage package.',
]

export function StickyActions() {
  const [expanded, setExpanded] = useState(false)
  const [whatsappOpen, setWhatsappOpen] = useState(false)

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpanded(false)
        setWhatsappOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openWhatsApp = (msg?: string) => {
    const text = encodeURIComponent(msg || `Hi Eliya Tours, I'd like to plan a trip.`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  const call = () => {
    window.location.href = `tel:${PHONE_NUMBER}`
  }

  return (
    <>
      {/* ===== WhatsApp quick-message modal ===== */}
      {whatsappOpen && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-stone-950/55 backdrop-blur-sm p-4"
          onClick={() => setWhatsappOpen(false)}
        >
          <div
            className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setWhatsappOpen(false)}
              className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full hover:bg-stone-200 text-stone-700"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-green-500 text-white">
                <MessageCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-stone-950">WhatsApp Eliya</h3>
                <p className="text-xs text-stone-500">{DISPLAY_PHONE} · Fastest reply</p>
              </div>
            </div>
            <p className="text-sm text-stone-600 mb-3">Pick a quick message or type your own:</p>
            <div className="space-y-2">
              {PRESET_MESSAGES.map((m) => (
                <button
                  key={m}
                  onClick={() => openWhatsApp(m)}
                  className="w-full text-left text-sm px-3 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 ring-1 ring-stone-200 text-stone-700 transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={() => openWhatsApp()}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp chat
            </button>
          </div>
        </div>
      )}

      {/* ===== Floating action cluster (bottom-right) ===== */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {/* Expanded tooltip on hover (desktop) */}
        {expanded && (
          <div className="hidden md:flex flex-col items-end gap-2 pb-1">
            <div className="bg-stone-900 text-amber-50 text-xs px-3 py-2 rounded-full shadow-lg whitespace-nowrap">
              Chat with Tariq · Imran · or our sales desk →
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          {/* WhatsApp button */}
          <button
            onClick={() => setWhatsappOpen(true)}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            aria-label="WhatsApp us"
            className="group relative grid place-items-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-[0_8px_24px_-4px_rgba(34,197,94,0.5)] transition-all hover:scale-105"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-green-500/40 eliya-pulse-ring" />
            <MessageCircle className="w-6 h-6 relative" strokeWidth={2.2} />
            {/* Mobile label */}
            <span className="md:hidden absolute right-16 whitespace-nowrap bg-stone-900 text-amber-50 text-xs px-2.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              WhatsApp
            </span>
          </button>

          {/* Call button */}
          <button
            onClick={call}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            aria-label="Call us"
            className="group relative grid place-items-center w-14 h-14 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-50 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] transition-all hover:scale-105"
          >
            <Phone className="w-5 h-5 relative" strokeWidth={2.2} />
            <span className="md:hidden absolute right-16 whitespace-nowrap bg-stone-900 text-amber-50 text-xs px-2.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              Call
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
