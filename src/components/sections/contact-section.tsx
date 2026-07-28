'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, MessageCircle, Send, Check } from 'lucide-react'
import { companyInfo, destinations } from '@/lib/destinations'

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    destination: destinations[0].name,
    dates: '',
    party: '2 adults',
    notes: '',
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 6000)
  }

  return (
    <section id="contact" className="relative bg-stone-950 text-amber-50 py-20 sm:py-28">
      {/* Backdrop */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(800px circle at 80% 20%, rgba(255, 200, 100, 0.18) 0%, transparent 50%), radial-gradient(700px circle at 10% 80%, rgba(120, 200, 180, 0.12) 0%, transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
          {/* ===== Left: pitch + contact details ===== */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-amber-300/80" />
              <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">
                Plan your journey
              </span>
            </div>
            <h2 className="text-balance text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
              Tell us what you dream of.
              <span className="block italic font-light text-amber-200/80 mt-2">
                We&apos;ll send a draft itinerary in 24 hours.
              </span>
            </h2>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-300 max-w-lg">
              Every Eliya trip is bespoke. Fill the form and our team in Srinagar will reply with a
              draft itinerary, a price estimate and the name of the local host who will run your trip.
              No deposit, no obligation.
            </p>

            <div className="mt-10 space-y-3">
              <a
                href={`tel:${companyInfo.phone}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-900 ring-1 ring-amber-50/10 hover:ring-amber-50/30 transition-all group"
              >
                <span className="grid place-items-center w-11 h-11 rounded-full bg-amber-50/10 ring-1 ring-amber-50/20 text-amber-50 group-hover:bg-amber-50/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">Call us</div>
                  <div className="text-sm font-medium">{companyInfo.phone}</div>
                </div>
                <span className="text-[10px] text-amber-200/60">Mon · Sat · 9am · 8pm IST</span>
              </a>

              <a
                href={`https://wa.me/${companyInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-900 ring-1 ring-amber-50/10 hover:ring-amber-50/30 transition-all group"
              >
                <span className="grid place-items-center w-11 h-11 rounded-full bg-amber-50/10 ring-1 ring-amber-50/20 text-amber-50 group-hover:bg-amber-50/20 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">WhatsApp</div>
                  <div className="text-sm font-medium">{companyInfo.whatsapp}</div>
                </div>
                <span className="text-[10px] text-amber-200/60">Fastest reply</span>
              </a>

              <a
                href={`mailto:${companyInfo.email}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-stone-900 ring-1 ring-amber-50/10 hover:ring-amber-50/30 transition-all group"
              >
                <span className="grid place-items-center w-11 h-11 rounded-full bg-amber-50/10 ring-1 ring-amber-50/20 text-amber-50 group-hover:bg-amber-50/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">Email</div>
                  <div className="text-sm font-medium">{companyInfo.email}</div>
                </div>
              </a>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-stone-900 ring-1 ring-amber-50/10">
                <span className="grid place-items-center w-11 h-11 rounded-full bg-amber-50/10 ring-1 ring-amber-50/20 text-amber-50 shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">Visit our office</div>
                  <div className="text-sm font-medium leading-relaxed">{companyInfo.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Right: enquiry form ===== */}
          <div className="relative">
            <form
              onSubmit={onSubmit}
              className="bg-stone-900 ring-1 ring-amber-50/15 rounded-3xl p-6 sm:p-8 eliya-shadow-deep"
            >
              <h3 className="text-xl font-semibold tracking-tight text-amber-50">
                Enquiry form
              </h3>
              <p className="text-sm text-stone-400 mt-1">
                All fields except notes are required.
              </p>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl px-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all"
                    placeholder="e.g. Aarav Mehta"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl px-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all"
                    placeholder="you@email.com"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">
                    Destination
                  </label>
                  <select
                    required
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl px-4 py-3 text-sm text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.name} className="bg-stone-950">
                        {d.name}
                      </option>
                    ))}
                    <option value="Multi-destination" className="bg-stone-950">
                      Multi-destination (valley tour)
                    </option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">
                    Travel dates
                  </label>
                  <input
                    type="text"
                    required
                    value={form.dates}
                    onChange={(e) => setForm({ ...form, dates: e.target.value })}
                    className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl px-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all"
                    placeholder="e.g. 12–19 Oct 2026"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">
                    Party size
                  </label>
                  <input
                    type="text"
                    required
                    value={form.party}
                    onChange={(e) => setForm({ ...form, party: e.target.value })}
                    className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl px-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all"
                    placeholder="e.g. 2 adults + 1 child"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl px-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all resize-none"
                    placeholder="Dietary needs, mobility considerations, must-see places…"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-amber-50 text-stone-900 rounded-full py-3.5 text-sm font-semibold hover:bg-white transition-all disabled:opacity-70"
              >
                {submitted ? (
                  <>
                    <Check className="w-4 h-4" />
                    Enquiry received · we&apos;ll reply within 24h
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send my enquiry
                  </>
                )}
              </button>

              <p className="mt-4 text-[11px] text-stone-500 text-center">
                By submitting you agree to be contacted by Eliya Tours And Travels. We never share
                your details with third parties.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
