'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Phone, Mail, MapPin, MessageCircle, Send, Check } from 'lucide-react'
import { useNav } from '@/lib/router'

export function ContactPage() {
  const nav = useNav()
  const [submitted, setSubmitted] = useState(false)
  const [destinations, setDestinations] = useState<Array<{ id: string; name: string }>>([])
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    destination: 'srinagar',
    dates: '',
    party: '2 adults',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data) => {
        if (data.destinations) {
          setDestinations(data.destinations.map((d: Record<string, unknown>) => ({ id: d.id as string, name: d.name as string })))
        }
      })
      .catch(() => {})
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (r.ok) {
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 8000)
        setForm({ name: '', email: '', phone: '', destination: 'srinagar', dates: '', party: '2 adults', notes: '' })
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-stone-950 text-amber-50 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Plan your journey.</h1>
          <p className="mt-3 text-base sm:text-lg text-stone-300 max-w-2xl">
            Tell us what you dream of. We&apos;ll send a draft itinerary in 24 hours.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
          {/* Contact methods */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-stone-950 mb-4">Get in touch directly</h2>
            <div className="space-y-3">
              <a href="tel:+919419012345" className="flex items-center gap-4 p-4 rounded-2xl bg-white ring-1 ring-stone-200 hover:ring-stone-300 transition-all group">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-stone-100 text-stone-700 group-hover:bg-stone-900 group-hover:text-amber-50 transition-colors">
                  <Phone className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Call us</div>
                  <div className="text-sm font-medium text-stone-950">+91 94190 12345</div>
                </div>
                <span className="text-[10px] text-stone-500">Mon — Sat · 9am — 8pm IST</span>
              </a>
              <a href="https://wa.me/919419012345" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white ring-1 ring-stone-200 hover:ring-stone-300 transition-all group">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-green-100 text-green-700 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">WhatsApp</div>
                  <div className="text-sm font-medium text-stone-950">+91 94190 12345</div>
                </div>
                <span className="text-[10px] text-green-600">Fastest reply</span>
              </a>
              <a href="mailto:hello@eliyatours.in" className="flex items-center gap-4 p-4 rounded-2xl bg-white ring-1 ring-stone-200 hover:ring-stone-300 transition-all group">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-stone-100 text-stone-700 group-hover:bg-stone-900 group-hover:text-amber-50 transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Email</div>
                  <div className="text-sm font-medium text-stone-950">hello@eliyatours.in</div>
                </div>
              </a>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white ring-1 ring-stone-200">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-stone-100 text-stone-700 shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-stone-500">Visit our office</div>
                  <div className="text-sm font-medium text-stone-950 leading-relaxed">Boulevard Road, Nigeen Lake, Srinagar, Jammu &amp; Kashmir 190003</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <form onSubmit={onSubmit} className="bg-white ring-1 ring-stone-200 rounded-3xl p-6 sm:p-8 eliya-shadow-soft">
              <h2 className="text-xl font-semibold tracking-tight text-stone-950">Enquiry form</h2>
              <p className="text-sm text-stone-500 mt-1">Your enquiry is saved to our system — Tariq or Imran will reply within 24 hours.</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Your name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all" placeholder="e.g. Aarav Mehta" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all" placeholder="you@email.com" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Phone (optional)</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all" placeholder="+91 ..." />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Destination *</label>
                  <select required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all">
                    {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    <option value="multi">Multi-destination (valley tour)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Travel dates *</label>
                  <input type="text" required value={form.dates} onChange={(e) => setForm({ ...form, dates: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all" placeholder="e.g. 12–19 Oct 2026" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Party size *</label>
                  <input type="text" required value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all" placeholder="e.g. 2 adults + 1 child" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Notes (optional)</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all resize-none" placeholder="Dietary needs, mobility considerations, must-see places…" />
                </div>
              </div>
              <button type="submit" disabled={submitted} className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-full py-3.5 text-sm font-semibold hover:bg-stone-700 transition-all disabled:opacity-70">
                {submitted ? (<><Check className="w-4 h-4" /> Enquiry received — we&apos;ll reply within 24h</>) : (<><Send className="w-4 h-4" /> Send my enquiry</>)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
