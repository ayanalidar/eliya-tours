'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, LogOut, Lock, Mail, User, Phone, Loader2, CalendarDays, CreditCard, FileText, Check, X, Plus } from 'lucide-react'
import { useNav } from '@/lib/router'
import { useApp } from '@/lib/app-context'

// ============================================================
// Guest portal · PIN login + register, then view own bookings
// ============================================================

type Guest = { id: string; name: string; email: string; phone: string | null }
type Booking = {
  id: string
  reference: string
  packageName: string
  startDate: string
  endDate: string
  party: string
  totalAmount: number
  currency: string
  paymentStatus: string
  status: string
  createdAt: string
}

export function GuestPortalPage() {
  const nav = useNav()
  const { pushToast, convertPrice } = useApp()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [checking, setChecking] = useState(true)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', pin: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => {
    fetch('/api/guest-auth')
      .then((r) => r.json())
      .then((d) => setGuest(d.guest || null))
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    if (guest) {
      fetch('/api/bookings')
        .then((r) => r.json())
        .then((d) => setBookings(d.bookings || []))
        .catch(() => {})
    }
  }, [guest])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/guest-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'register'
            ? { action: 'register', name: form.name, email: form.email, phone: form.phone, pin: form.pin }
            : { email: form.email, pin: form.pin }
        ),
      })
      const data = await r.json()
      if (!r.ok) {
        setError(data.error || 'Authentication failed')
      } else if (data.guest) {
        setGuest(data.guest)
        pushToast({ type: 'success', title: mode === 'register' ? 'Account created' : 'Welcome back', message: data.guest.name })
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/guest-auth', { method: 'DELETE' })
    setGuest(null)
    setBookings([])
  }

  if (checking) return <div className="min-h-screen grid place-items-center bg-stone-50"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>

  if (!guest) {
    return (
      <div className="min-h-screen bg-stone-950 grid place-items-center p-4 pt-24">
        <div className="max-w-md w-full bg-stone-900 ring-1 ring-amber-50/10 rounded-3xl p-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/70 hover:text-amber-50 text-xs mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </button>
          <div className="flex items-center gap-3 mb-6">
            <span className="grid place-items-center w-12 h-12 rounded-full bg-amber-50/10 ring-1 ring-amber-50/20 text-amber-200">
              <User className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-amber-50">Guest portal</h1>
              <p className="text-xs text-amber-200/70">{mode === 'login' ? 'Log in to view your bookings' : 'Create an account to track your trips'}</p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 bg-stone-950/60 rounded-full mb-5">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 text-xs font-medium py-2 rounded-full transition-colors ${mode === 'login' ? 'bg-amber-50 text-stone-900' : 'text-amber-50/70 hover:text-amber-50'}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 text-xs font-medium py-2 rounded-full transition-colors ${mode === 'register' ? 'bg-amber-50 text-stone-900' : 'text-amber-50/70 hover:text-amber-50'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl pl-10 pr-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50" placeholder="Your name" />
                </div>
              </div>
            )}
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl pl-10 pr-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50" placeholder="you@email.com" />
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">Phone (optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl pl-10 pr-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50" placeholder="+91 ..." />
                </div>
              </div>
            )}
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">6-digit PIN</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} required value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })} className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl pl-10 pr-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-amber-300/50" placeholder="••••••" />
              </div>
            </div>
            {error && <p className="text-xs text-red-400 bg-red-500/10 ring-1 ring-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading || form.pin.length !== 6} className="w-full inline-flex items-center justify-center gap-2 bg-amber-50 text-stone-900 rounded-xl py-3 text-sm font-semibold hover:bg-white disabled:opacity-50 transition-colors">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Logged in dashboard
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-stone-950 text-amber-50 pt-24 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to site
            </button>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Hello, {guest.name.split(' ')[0]}</h1>
            <p className="mt-2 text-sm text-stone-300">View your bookings, manage your trips, and access invoices.</p>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-amber-50/85 hover:text-amber-50 bg-stone-800/60 hover:bg-stone-800 px-3 py-1.5 rounded-full">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {/* New booking CTA */}
        <div className="mb-6 p-5 rounded-2xl bg-stone-900 text-amber-50 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Planning another trip?</div>
            <div className="text-xs text-amber-200/70 mt-0.5">Browse packages and book your next adventure.</div>
          </div>
          <button onClick={() => nav({ name: 'booking' })} className="inline-flex items-center gap-1.5 bg-amber-50 text-stone-900 rounded-full px-4 py-2 text-sm font-medium hover:bg-white">
            <Plus className="w-4 h-4" /> New booking
          </button>
        </div>

        <h2 className="text-lg font-semibold text-stone-950 mb-3">Your bookings ({bookings.length})</h2>

        {bookings.length === 0 ? (
          <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-8 text-center">
            <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-500">No bookings yet. Book your first trip!</p>
            <button onClick={() => nav({ name: 'booking' })} className="mt-3 text-stone-950 font-medium text-sm underline">Browse packages</button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-stone-950">{b.reference}</span>
                      <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
                        b.paymentStatus === 'paid' ? 'bg-green-100 text-green-900' :
                        b.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-900' :
                        'bg-red-100 text-red-900'
                      }`}>{b.paymentStatus}</span>
                      <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-900' :
                        b.status === 'completed' ? 'bg-stone-100 text-stone-700' :
                        'bg-red-100 text-red-900'
                      }`}>{b.status}</span>
                    </div>
                    <div className="text-sm font-medium text-stone-950 mt-1">{b.packageName}</div>
                    <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="w-3 h-3" />{b.startDate} → {b.endDate}</span>
                      <span>· {b.party}</span>
                      <span>· Booked {new Date(b.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold tabular-nums text-stone-950">{convertPrice(b.totalAmount).formatted}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-[0.18em]">Total</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-stone-100">
                  <a
                    href={`https://wa.me/917006734747?text=${encodeURIComponent(`Hi Eliya, regarding my booking ${b.reference} (${b.packageName}).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs inline-flex items-center gap-1.5 text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 ring-1 ring-green-200 px-3 py-1.5 rounded-full"
                  >
                    WhatsApp about this booking
                  </a>
                  {b.paymentStatus !== 'paid' && (
                    <button
                      onClick={() => pushToast({ type: 'info', title: 'Payment', message: 'Our team will WhatsApp you to arrange payment.' })}
                      className="text-xs inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full"
                    >
                      <CreditCard className="w-3 h-3" /> Pay now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
