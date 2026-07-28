'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Loader2, Tag, Shield, CreditCard, Wallet, Banknote, Lock, CalendarDays, Users, Sparkles } from 'lucide-react'
import { useNav } from '@/lib/router'
import { useApp } from '@/lib/app-context'
import { safeStringArray } from '@/lib/safe-parse'

// ============================================================
// Booking page — collects guest details, validates promo codes,
// computes pricing, and creates a booking via /api/bookings
// ============================================================

type Season = { id: string; title: string; priceFrom: number; duration: string; destinations: string; image: string; color: string }
type Offer = { valid: boolean; discountPct: number; title?: string; description?: string }

export function BookingPage({ preselectedPackageId }: { preselectedPackageId?: string }) {
  const nav = useNav()
  const { convertPrice, pushToast } = useApp()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedPackage, setSelectedPackage] = useState<string>(preselectedPackageId || '')
  const [form, setForm] = useState({
    guestName: '', guestEmail: '', guestPhone: '',
    startDate: '', endDate: '', party: '2 adults',
    promoCode: '', notes: '',
  })
  const [promoStatus, setPromoStatus] = useState<Offer | null>(null)
  const [promoChecking, setPromoChecking] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi' | 'bank' | 'cash'>('razorpay')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{ reference: string; totalAmount: number } | null>(null)

  useEffect(() => {
    fetch('/api/seasons')
      .then((r) => r.json())
      .then((d) => {
        setSeasons(d.seasons || [])
        if (preselectedPackageId) setSelectedPackage(preselectedPackageId)
      })
      .catch(() => {})
  }, [preselectedPackageId])

  const selectedSeason = seasons.find((s) => s.id === selectedPackage)
  const baseAmount = selectedSeason?.priceFrom || 0
  const discountPct = promoStatus?.valid ? promoStatus.discountPct : 0
  const discountedAmount = baseAmount * (1 - discountPct / 100)
  const taxPct = 5
  const totalAmount = Math.round(discountedAmount * (1 + taxPct / 100))

  // Debounced promo validation
  useEffect(() => {
    if (!form.promoCode) { setPromoStatus(null); return }
    setPromoChecking(true)
    const t = setTimeout(() => {
      fetch(`/api/offers?validate=${encodeURIComponent(form.promoCode.toUpperCase())}`)
        .then((r) => r.json())
        .then((d) => setPromoStatus(d))
        .catch(() => {})
        .finally(() => setPromoChecking(false))
    }, 600)
    return () => clearTimeout(t)
  }, [form.promoCode])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSeason) {
      pushToast({ type: 'error', title: 'Select a package', message: 'Choose which package you want to book.' })
      return
    }
    if (!form.guestName || !form.guestEmail || !form.guestPhone || !form.startDate || !form.endDate) {
      pushToast({ type: 'error', title: 'Missing details', message: 'Please fill all required fields.' })
      return
    }

    setSubmitting(true)
    try {
      const r = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: form.guestName,
          guestEmail: form.guestEmail,
          guestPhone: form.guestPhone,
          packageName: selectedSeason.title,
          destinationIds: safeStringArray(selectedSeason.destinations),
          startDate: form.startDate,
          endDate: form.endDate,
          party: form.party,
          baseAmount,
          discountCode: form.promoCode || undefined,
          taxPct,
          paymentMethod,
        }),
      })
      const data = await r.json()
      if (r.ok && data.booking) {
        setConfirmation({ reference: data.booking.reference, totalAmount: data.booking.totalAmount })
        pushToast({ type: 'success', title: 'Booking confirmed!', message: `Reference: ${data.booking.reference}` })
      } else {
        pushToast({ type: 'error', title: 'Booking failed', message: data.error || 'Please try again.' })
      }
    } catch (e) {
      pushToast({ type: 'error', title: 'Network error', message: (e as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <div className="min-h-screen bg-stone-50 grid place-items-center p-4 pt-24">
        <div className="max-w-md w-full bg-white ring-1 ring-stone-200 rounded-3xl p-8 text-center">
          <div className="grid place-items-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-950">Booking confirmed!</h1>
          <p className="text-sm text-stone-500 mt-2">We&apos;ve received your booking. Our team will WhatsApp you within 24 hours to confirm payment and details.</p>

          <div className="mt-6 p-4 rounded-2xl bg-stone-50 ring-1 ring-stone-200 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Reference</span>
              <span className="font-mono font-semibold text-stone-950">{confirmation.reference}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-stone-500">Total amount</span>
              <span className="font-semibold text-stone-950 tabular-nums">{convertPrice(confirmation.totalAmount).formatted}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <a
              href={`https://wa.me/919419012345?text=${encodeURIComponent(`Hi Eliya team, I just made a booking — reference ${confirmation.reference}. I'd like to confirm payment details.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <Wallet className="w-4 h-4" /> Confirm on WhatsApp
            </a>
            <button
              onClick={() => nav({ name: 'guest-portal' })}
              className="inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-xl py-3 text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              View in my portal
            </button>
            <button
              onClick={() => nav({ name: 'home' })}
              className="text-stone-500 hover:text-stone-950 text-sm py-2"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-stone-950 text-amber-50 pt-24 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Book your trip</h1>
          <p className="mt-2 text-sm text-stone-300">Choose a package, enter your details, apply promo codes, and we&apos;ll confirm by WhatsApp within 24 hours.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Left: form fields */}
        <div className="space-y-5">
          {/* Package selection */}
          <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-950 mb-3">1. Choose your package</h2>
            <div className="grid gap-2">
              {seasons.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSelectedPackage(s.id)}
                  className={`text-left p-3 rounded-xl ring-1 transition-all flex items-center gap-3 ${
                    selectedPackage === s.id ? 'ring-stone-900 bg-stone-50' : 'ring-stone-200 hover:ring-stone-400'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${s.image})` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-stone-950">{s.title}</div>
                    <div className="text-xs text-stone-500">{s.duration} · from {convertPrice(s.priceFrom).formatted}/person</div>
                  </div>
                  {selectedPackage === s.id && <Check className="w-4 h-4 text-green-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Guest details */}
          <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-950 mb-3">2. Your details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Full name *" value={form.guestName} onChange={(v) => setForm({ ...form, guestName: v })} placeholder="Aarav Mehta" />
              <Input label="Email *" type="email" value={form.guestEmail} onChange={(v) => setForm({ ...form, guestEmail: v })} placeholder="you@email.com" />
              <Input label="Phone / WhatsApp *" type="tel" value={form.guestPhone} onChange={(v) => setForm({ ...form, guestPhone: v })} placeholder="+91 ..." />
              <Input label="Party size" value={form.party} onChange={(v) => setForm({ ...form, party: v })} placeholder="2 adults + 1 child" />
              <Input label="Start date *" type="date" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} />
              <Input label="End date *" type="date" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} />
            </div>
            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Notes (optional)</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none" placeholder="Dietary needs, mobility, must-see places…" />
            </div>
          </div>

          {/* Promo code */}
          <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-950 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> 3. Promo code (optional)
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.promoCode}
                onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
                placeholder="e.g. SPRING15"
                className="flex-1 bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
              {promoChecking && <Loader2 className="w-5 h-5 text-stone-400 animate-spin self-center" />}
            </div>
            {promoStatus?.valid && (
              <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 ring-1 ring-green-200 rounded-lg px-3 py-2">
                <Check className="w-3.5 h-3.5" />
                <span><strong>{promoStatus.title}</strong> — {promoStatus.discountPct}% off applied. {promoStatus.description}</span>
              </div>
            )}
            {form.promoCode && promoStatus && !promoStatus.valid && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 ring-1 ring-red-200 rounded-lg px-3 py-2">
                Invalid or expired code.
              </div>
            )}
            <p className="mt-2 text-[11px] text-stone-400">Try: SPRING15, COUPLE10, GROUP12, LADAKH8, DIWALI20</p>
          </div>

          {/* Payment method */}
          <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-stone-950 mb-3">4. Payment method</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'razorpay' as const, label: 'Card / Net Banking', sub: 'Razorpay', Icon: CreditCard },
                { id: 'upi' as const, label: 'UPI', sub: 'GPay / PhonePe / Paytm', Icon: Wallet },
                { id: 'bank' as const, label: 'Bank Transfer', sub: 'NEFT / IMPS', Icon: Banknote },
                { id: 'cash' as const, label: 'Pay on arrival', sub: 'Cash at Srinagar office', Icon: Banknote },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`text-left p-3 rounded-xl ring-1 transition-all flex items-center gap-3 ${
                    paymentMethod === m.id ? 'ring-stone-900 bg-stone-50' : 'ring-stone-200 hover:ring-stone-400'
                  }`}
                >
                  <m.Icon className="w-4 h-4 text-stone-700" />
                  <div>
                    <div className="text-xs font-medium text-stone-950">{m.label}</div>
                    <div className="text-[10px] text-stone-500">{m.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-stone-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Demo mode — no real payment is processed. We&apos;ll arrange payment via WhatsApp after confirmation.
            </p>
          </div>
        </div>

        {/* Right: pricing summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-stone-950 text-amber-50 rounded-2xl p-5">
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-semibold mb-3">Booking summary</h3>
            {selectedSeason ? (
              <>
                <div className="text-base font-semibold">{selectedSeason.title}</div>
                <div className="text-xs text-amber-200/70 mt-0.5">{selectedSeason.duration}</div>
              </>
            ) : (
              <div className="text-sm text-amber-200/70">No package selected</div>
            )}

            <div className="mt-4 pt-4 border-t border-amber-50/10 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-200/70">Base price</span>
                <span className="tabular-nums">{convertPrice(baseAmount).formatted}</span>
              </div>
              {discountPct > 0 && (
                <div className="flex justify-between text-green-300">
                  <span>Discount ({discountPct}%)</span>
                  <span className="tabular-nums">-{convertPrice(baseAmount * discountPct / 100).formatted}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-amber-200/70">Tax ({taxPct}%)</span>
                <span className="tabular-nums">+{convertPrice(discountedAmount * taxPct / 100).formatted}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-amber-50/10 text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{convertPrice(totalAmount).formatted}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedSeason}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-amber-50 text-stone-900 rounded-xl py-3 text-sm font-semibold hover:bg-white disabled:opacity-50 disabled:hover:bg-amber-50 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {submitting ? 'Confirming…' : 'Confirm booking'}
            </button>

            <div className="mt-4 flex items-start gap-2 text-[11px] text-amber-200/60">
              <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
              <span>Free cancellation up to 14 days before travel. 50% refund up to 7 days. No refund within 7 days.</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
    </div>
  )
}
