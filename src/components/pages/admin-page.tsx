'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ArrowLeft, LogOut, Lock, Mail, LayoutDashboard, MapPin, CalendarDays, Hotel as HotelIcon,
  Inbox, FileText, Plus, Edit, Trash2, Check, X, Download, Sparkles, Loader2,
  Tag, Star, Mountain, Upload, ImageIcon, DollarSign, Route, Database,
} from 'lucide-react'
import { useNav } from '@/lib/router'
import { UniversalEditor } from '@/components/admin/universal-editor'
import { HeroEditor } from '@/components/admin/hero-editor'
import { safeJsonParse } from '@/lib/safe-parse'

// ============================================================
// Admin panel · PIN-based login + CMS
// ============================================================

type AdminUser = { id: string; name: string; email: string; role: string }

export function AdminPage() {
  const nav = useNav()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<
    'dashboard' | 'enquiries' | 'destinations' | 'seasons' | 'hotels' | 'invoices' |
    'offers' | 'reviews' | 'bookings' | 'adventures' | 'pricing' | 'itineraries' | 'data-editor' | 'hero'
  >('dashboard')

  useEffect(() => {
    fetch('/api/auth')
      .then((r) => r.json())
      .then((data) => setUser(data.user || null))
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    setUser(null)
  }

  if (checking) {
    return <div className="min-h-screen grid place-items-center bg-stone-950 text-amber-50"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  if (!user) {
    return <LoginScreen onSuccess={setUser} onBack={() => nav({ name: 'home' })} />
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'enquiries' as const, label: 'Enquiries', Icon: Inbox },
    { id: 'bookings' as const, label: 'Bookings', Icon: FileText },
    { id: 'destinations' as const, label: 'Destinations', Icon: MapPin },
    { id: 'adventures' as const, label: 'Adventures', Icon: Mountain },
    { id: 'seasons' as const, label: 'Seasons', Icon: CalendarDays },
    { id: 'hotels' as const, label: 'Hotels', Icon: HotelIcon },
    { id: 'pricing' as const, label: 'Pricing', Icon: DollarSign },
    { id: 'offers' as const, label: 'Offers', Icon: Tag },
    { id: 'reviews' as const, label: 'Reviews', Icon: Star },
    { id: 'invoices' as const, label: 'Invoices', Icon: FileText },
    { id: 'itineraries' as const, label: 'Itineraries', Icon: Route },
    { id: 'data-editor' as const, label: 'Data Editor', Icon: Database },
    { id: 'hero' as const, label: 'Hero Section', Icon: ImageIcon },
  ]

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      <header className="bg-stone-950 text-amber-50 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <button onClick={() => nav({ name: 'home' })} className="grid place-items-center w-9 h-9 rounded-full hover:bg-stone-800 transition-colors" aria-label="Back home">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-amber-50/10 ring-1 ring-amber-50/20 text-amber-200">
              <LayoutDashboard className="w-4 h-4" />
            </span>
            <div>
              <h1 className="text-sm font-semibold">Eliya Admin</h1>
              <p className="text-[10px] text-amber-200/70">{user.name} · {user.role}</p>
            </div>
          </div>
          <div className="ml-auto">
            <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-amber-50/85 hover:text-amber-50 bg-stone-800/60 hover:bg-stone-800 px-3 py-1.5 rounded-full transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-stone-200 sticky top-[57px] z-20">
        <div className="mx-auto max-w-7xl px-4 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-stone-900 text-stone-950' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <t.Icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
        {tab === 'dashboard' && <Dashboard user={user} setTab={setTab} />}
        {tab === 'enquiries' && <EnquiriesManager />}
        {tab === 'bookings' && <BookingsManager />}
        {tab === 'destinations' && <DestinationsManager />}
        {tab === 'adventures' && <AdventuresManager />}
        {tab === 'seasons' && <SeasonsManager />}
        {tab === 'hotels' && <HotelsManager />}
        {tab === 'pricing' && <PricingManager />}
        {tab === 'offers' && <OffersManager />}
        {tab === 'reviews' && <ReviewsManager />}
        {tab === 'invoices' && <InvoicesManager user={user} />}
        {tab === 'itineraries' && <ItinerariesManager user={user} />}
        {tab === 'data-editor' && <UniversalEditor />}
        {tab === 'hero' && <HeroEditor />}
      </main>
    </div>
  )
}

// ============================================================
// Login screen
// ============================================================
function LoginScreen({ onSuccess, onBack }: { onSuccess: (u: AdminUser) => void; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      })
      const data = await r.json()
      if (!r.ok) {
        setError(data.error || 'Login failed')
      } else if (data.user) {
        onSuccess(data.user)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 grid place-items-center p-4">
      <div className="max-w-md w-full bg-stone-900 ring-1 ring-amber-50/10 rounded-3xl p-8">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-amber-50/70 hover:text-amber-50 text-xs mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to site
        </button>
        <div className="flex items-center gap-3 mb-6">
          <span className="grid place-items-center w-12 h-12 rounded-full bg-amber-50/10 ring-1 ring-amber-50/20 text-amber-200">
            <Lock className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-amber-50">Eliya Admin</h1>
            <p className="text-xs text-amber-200/70">PIN-based login for staff</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl pl-10 pr-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all"
                placeholder="tariq@eliyatours.in"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.18em] text-amber-200/70 font-medium block mb-1.5">6-digit PIN</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                required
                className="w-full bg-stone-950 ring-1 ring-amber-50/15 rounded-xl pl-10 pr-4 py-3 text-sm text-amber-50 placeholder:text-stone-500 tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition-all"
                placeholder="••••••"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-400 bg-red-500/10 ring-1 ring-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading || pin.length !== 6}
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-50 text-stone-900 rounded-xl py-3 text-sm font-semibold hover:bg-white disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Login
          </button>
        </form>
        <div className="mt-5 pt-5 border-t border-amber-50/10 text-[11px] text-amber-200/60">
          <p className="font-semibold mb-1">Demo credentials:</p>
          <p>tariq@eliyatours.in · PIN 901234 (admin)</p>
          <p>imran@eliyatours.in · PIN 567890 (editor)</p>
          <p>sales@eliyatours.in · PIN 111111 (sales)</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Dashboard
// ============================================================
type TabId = 'dashboard' | 'enquiries' | 'destinations' | 'seasons' | 'hotels' | 'invoices' | 'offers' | 'reviews' | 'bookings' | 'adventures' | 'pricing' | 'itineraries' | 'data-editor' | 'hero'
function Dashboard({ user, setTab }: { user: AdminUser; setTab: (t: TabId) => void }) {
  const [stats, setStats] = useState({ enquiries: 0, destinations: 0, seasons: 0, hotels: 0, invoices: 0, newEnquiries: 0, bookings: 0, adventures: 0, offers: 0, pendingReviews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard-stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 animate-pulse">
          <div className="w-5 h-5 bg-stone-200 rounded mb-2"></div>
          <div className="h-8 w-12 bg-stone-200 rounded"></div>
          <div className="h-3 w-20 bg-stone-100 rounded mt-2"></div>
        </div>
      ))}
    </div>
  )

  const cards = [
    { label: 'New enquiries', value: stats.newEnquiries, total: stats.enquiries, color: 'bg-amber-100 text-amber-900', Icon: Inbox, tab: 'enquiries' as const },
    { label: 'Bookings', value: stats.bookings, color: 'bg-green-100 text-green-900', Icon: FileText, tab: 'bookings' as const },
    { label: 'Pending reviews', value: stats.pendingReviews, color: 'bg-blue-100 text-blue-900', Icon: Star, tab: 'reviews' as const },
    { label: 'Destinations', value: stats.destinations, color: 'bg-stone-100 text-stone-900', Icon: MapPin, tab: 'destinations' as const },
    { label: 'Adventures', value: stats.adventures, color: 'bg-stone-100 text-stone-900', Icon: Mountain, tab: 'adventures' as const },
    { label: 'Seasons', value: stats.seasons, color: 'bg-stone-100 text-stone-900', Icon: CalendarDays, tab: 'seasons' as const },
    { label: 'Hotels', value: stats.hotels, color: 'bg-stone-100 text-stone-900', Icon: HotelIcon, tab: 'hotels' as const },
    { label: 'Offers', value: stats.offers, color: 'bg-amber-100 text-amber-900', Icon: Tag, tab: 'offers' as const },
    { label: 'Invoices', value: stats.invoices, color: 'bg-stone-100 text-stone-900', Icon: FileText, tab: 'invoices' as const },
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-stone-950 mb-1">Welcome back, {user.name.split(' ')[0]}</h2>
      <p className="text-sm text-stone-500 mb-6">Here&apos;s what&apos;s happening at Eliya today.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => setTab(c.tab)}
            className={`text-left p-5 rounded-2xl ring-1 ring-stone-200 ${c.color} hover:ring-stone-400 transition-all`}
          >
            <c.Icon className="w-5 h-5 mb-2 opacity-70" />
            <div className="text-3xl font-semibold tabular-nums">{c.value}</div>
            <div className="text-xs uppercase tracking-[0.15em] opacity-70 mt-1">{c.label}{c.total !== undefined ? ` / ${c.total}` : ''}</div>
          </button>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-2xl bg-stone-950 text-amber-50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <h3 className="text-sm font-semibold">What you can do here</h3>
        </div>
        <ul className="text-xs text-stone-300 space-y-1.5">
          <li>• View &amp; respond to enquiries from the &quot;Plan my trip&quot; form</li>
          <li>• Manage bookings, mark payments as received</li>
          <li>• Add/edit destinations, adventures, seasons, hotels · upload images directly</li>
          <li>• Approve guest reviews &amp; reply to them</li>
          <li>• Create offers &amp; promo codes for the booking page</li>
          <li>• Set seasonal hotel pricing (per-month multipliers)</li>
          <li>• Build day-by-day itinerary templates</li>
          <li>• Create invoices for confirmed bookings (auto-calculates tax &amp; discount)</li>
        </ul>
      </div>
    </div>
  )
}

// ============================================================
// Enquiries manager
// ============================================================
function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/enquiries${filter !== 'all' ? `?status=${filter}` : ''}`)
      .then((r) => r.json())
      .then((d) => setEnquiries(d.enquiries || []))
      .finally(() => setLoading(false))
  }, [filter])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  // Real-time sync: refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => load(), 30000)
    return () => clearInterval(interval)
  }, [load])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/enquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Enquiries ({enquiries.length})</h2>
        <div className="flex items-center gap-1">
          {['all', 'new', 'contacted', 'confirmed', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full ring-1 transition-all capitalize ${
                filter === s ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-white text-stone-700 ring-stone-300 hover:ring-stone-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-stone-500">Loading…</div>
      ) : enquiries.length === 0 ? (
        <div className="text-stone-500 text-sm">No enquiries in this filter.</div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-stone-950">{e.name as string}</h3>
                    <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
                      e.status === 'new' ? 'bg-amber-100 text-amber-900' :
                      e.status === 'confirmed' ? 'bg-green-100 text-green-900' :
                      e.status === 'closed' ? 'bg-stone-100 text-stone-600' :
                      'bg-blue-100 text-blue-900'
                    }`}>{e.status as string}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {e.email as string}{e.phone ? ` · ${e.phone as string}` : ''} · {new Date(e.createdAt as string).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateStatus(e.id as string, 'contacted')} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200">Contacted</button>
                  <button onClick={() => updateStatus(e.id as string, 'confirmed')} className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-200">Confirmed</button>
                  <button onClick={() => updateStatus(e.id as string, 'closed')} className="text-xs px-2.5 py-1 rounded-full bg-stone-50 text-stone-700 hover:bg-stone-100 ring-1 ring-stone-200">Close</button>
                </div>
              </div>
              <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs text-stone-700">
                <div><span className="text-stone-400">Destination:</span> {e.destination as string}</div>
                <div><span className="text-stone-400">Dates:</span> {e.dates as string}</div>
                <div><span className="text-stone-400">Party:</span> {e.party as string}</div>
              </div>
              {e.notes ? <p className="mt-2 text-sm text-stone-600 bg-stone-50 rounded-lg p-2">{e.notes as string}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Destinations manager · list + edit + add
// ============================================================
function DestinationsManager() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((d) => setItems(d.destinations || []))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const save = async (data: Record<string, unknown>) => {
    if (data._isNew) {
      const { _isNew, ...rest } = data
      await fetch('/api/destinations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) })
    } else {
      await fetch('/api/destinations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this destination?')) return
    await fetch(`/api/destinations?id=${id}`, { method: 'DELETE' })
    load()
  }

  if (editing) {
    return <DestinationEditor initial={editing} onSave={save} onCancel={() => setEditing(null)} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Destinations ({items.length})</h2>
        <button
          onClick={() => setEditing({ _isNew: true, id: '', name: '', region: '', area: '', elevation: '', bestSeason: '', tagline: '', description: '', longDescription: '', image: '', accent: 'oklch(0.62 0.13 165)', latitude: 34.0837, longitude: 74.7973, rating: 4.5, curated: 90, visitors: 50, safety: 90, highlights: '[]' })}
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-full px-4 py-2 hover:bg-stone-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New destination
        </button>
      </div>
      {loading ? <div className="text-stone-500">Loading…</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((d) => (
            <div key={d.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden flex">
              <div className="w-24 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${d.image as string})` }} />
              <div className="flex-1 p-3">
                <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500">{d.area as string}</div>
                <h3 className="font-semibold text-stone-950 text-sm">{d.name as string}</h3>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{d.tagline as string}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setEditing(d)} className="text-xs inline-flex items-center gap-1 text-stone-700 hover:text-stone-950"><Edit className="w-3 h-3" />Edit</button>
                  <button onClick={() => del(d.id as string)} className="text-xs inline-flex items-center gap-1 text-red-600 hover:text-red-700"><Trash2 className="w-3 h-3" />Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DestinationEditor({ initial, onSave, onCancel }: { initial: Record<string, unknown>; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Record<string, unknown>>(initial)
  const set = (k: string, v: unknown) => setForm({ ...form, [k]: v })

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-stone-950 mb-4">{initial._isNew ? 'New destination' : `Edit ${initial.name}`}</h2>
      <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
        <Field label="ID (url slug)" value={form.id as string} onChange={(v) => set('id', v)} />
        <Field label="Name" value={form.name as string} onChange={(v) => set('name', v)} />
        <Field label="Region" value={form.region as string} onChange={(v) => set('region', v)} />
        <Field label="Area (group)" value={form.area as string} onChange={(v) => set('area', v)} />
        <Field label="Elevation" value={form.elevation as string} onChange={(v) => set('elevation', v)} />
        <Field label="Best season" value={form.bestSeason as string} onChange={(v) => set('bestSeason', v)} />
        <Field label="Tagline" value={form.tagline as string} onChange={(v) => set('tagline', v)} />
        <div className="sm:col-span-2"><ImageUpload value={form.image as string} onChange={(url) => set('image', url)} /></div>
        <Field label="Accent color (oklch)" value={form.accent as string} onChange={(v) => set('accent', v)} />
        <Field label="Latitude" type="number" value={String(form.latitude)} onChange={(v) => set('latitude', Number(v))} />
        <Field label="Longitude" type="number" value={String(form.longitude)} onChange={(v) => set('longitude', Number(v))} />
        <Field label="Rating (0-5)" type="number" value={String(form.rating)} onChange={(v) => set('rating', Number(v))} />
        <Field label="Curated %" type="number" value={String(form.curated)} onChange={(v) => set('curated', Number(v))} />
        <Field label="Visitors %" type="number" value={String(form.visitors)} onChange={(v) => set('visitors', Number(v))} />
        <Field label="Safety %" type="number" value={String(form.safety)} onChange={(v) => set('safety', Number(v))} />
        <div className="sm:col-span-2">
          <Label>Description</Label>
          <textarea rows={2} value={form.description as string} onChange={(e) => set('description', e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <Label>Long description</Label>
          <textarea rows={5} value={form.longDescription as string} onChange={(e) => set('longDescription', e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <Label>Highlights (JSON array)</Label>
          <textarea rows={3} value={form.highlights as string} onChange={(e) => set('highlights', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => onSave(form)} className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-5 py-2 text-sm font-medium hover:bg-stone-700 transition-colors">
          <Check className="w-4 h-4" /> Save
        </button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 rounded-full px-5 py-2 text-sm font-medium ring-1 ring-stone-300 hover:ring-stone-500 transition-colors">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Seasons manager (simplified · list + edit)
// ============================================================
function SeasonsManager() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/seasons')
      .then((r) => r.json())
      .then((d) => setItems(d.seasons || []))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const save = async (data: Record<string, unknown>) => {
    if (data._isNew) {
      const { _isNew, ...rest } = data
      await fetch('/api/seasons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) })
    } else {
      await fetch('/api/seasons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this season?')) return
    await fetch(`/api/seasons?id=${id}`, { method: 'DELETE' })
    load()
  }

  if (editing) {
    return <SeasonEditor initial={editing} onSave={save} onCancel={() => setEditing(null)} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Seasons ({items.length})</h2>
        <button
          onClick={() => setEditing({ _isNew: true, id: '', season: '', months: '', title: '', theme: '', description: '', longDescription: '', image: '', color: 'oklch(0.55 0.15 165)', priceFrom: 25000, duration: '', isFeatured: false, destinations: '[]', itinerary: '[]' })}
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-full px-4 py-2 hover:bg-stone-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New season
        </button>
      </div>
      {loading ? <div className="text-stone-500">Loading…</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((s) => (
            <div key={s.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden flex">
              <div className="w-24 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${s.image as string})` }} />
              <div className="flex-1 p-3">
                <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500">{s.season as string} · {s.months as string}</div>
                <h3 className="font-semibold text-stone-950 text-sm">{s.title as string}</h3>
                <p className="text-xs text-stone-500 mt-0.5">₹{Number(s.priceFrom).toLocaleString('en-IN')} · {s.duration as string}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setEditing(s)} className="text-xs inline-flex items-center gap-1 text-stone-700 hover:text-stone-950"><Edit className="w-3 h-3" />Edit</button>
                  <button onClick={() => del(s.id as string)} className="text-xs inline-flex items-center gap-1 text-red-600 hover:text-red-700"><Trash2 className="w-3 h-3" />Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SeasonEditor({ initial, onSave, onCancel }: { initial: Record<string, unknown>; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Record<string, unknown>>(initial)
  const set = (k: string, v: unknown) => setForm({ ...form, [k]: v })

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-stone-950 mb-4">{initial._isNew ? 'New season' : `Edit ${initial.title}`}</h2>
      <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
        <Field label="ID" value={form.id as string} onChange={(v) => set('id', v)} />
        <Field label="Title" value={form.title as string} onChange={(v) => set('title', v)} />
        <Field label="Season" value={form.season as string} onChange={(v) => set('season', v)} />
        <Field label="Months" value={form.months as string} onChange={(v) => set('months', v)} />
        <Field label="Theme" value={form.theme as string} onChange={(v) => set('theme', v)} />
        <Field label="Duration" value={form.duration as string} onChange={(v) => set('duration', v)} />
        <Field label="Price from (INR)" type="number" value={String(form.priceFrom)} onChange={(v) => set('priceFrom', Number(v))} />
        <div className="sm:col-span-2"><ImageUpload value={form.image as string} onChange={(url) => set('image', url)} /></div>
        <Field label="Color (oklch)" value={form.color as string} onChange={(v) => set('color', v)} />
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(e) => set('isFeatured', e.target.checked)} />
            Featured (signature)
          </label>
        </div>
        <div className="sm:col-span-2"><Label>Description</Label><textarea rows={2} value={form.description as string} onChange={(e) => set('description', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><Label>Long description</Label><textarea rows={4} value={form.longDescription as string} onChange={(e) => set('longDescription', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><Label>Destinations (JSON array of ids)</Label><textarea rows={2} value={form.destinations as string} onChange={(e) => set('destinations', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><Label>Itinerary (JSON array of {`{day,title,desc}`})</Label><textarea rows={6} value={form.itinerary as string} onChange={(e) => set('itinerary', e.target.value)} className={inputCls} /></div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => onSave(form)} className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-5 py-2 text-sm font-medium hover:bg-stone-700 transition-colors"><Check className="w-4 h-4" /> Save</button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 rounded-full px-5 py-2 text-sm font-medium ring-1 ring-stone-300 hover:ring-stone-500 transition-colors"><X className="w-4 h-4" /> Cancel</button>
      </div>
    </div>
  )
}

// ============================================================
// Hotels manager
// ============================================================
function HotelsManager() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [destinations, setDestinations] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/hotels').then((r) => r.json()),
      fetch('/api/destinations').then((r) => r.json()),
    ])
      .then(([h, d]) => {
        setItems(h.hotels || [])
        setDestinations((d.destinations || []).map((x: Record<string, unknown>) => ({ id: x.id as string, name: x.name as string })))
      })
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const save = async (data: Record<string, unknown>) => {
    if (data._isNew) {
      const { _isNew, ...rest } = data
      await fetch('/api/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) })
    } else {
      await fetch('/api/hotels', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this hotel?')) return
    await fetch(`/api/hotels?id=${id}`, { method: 'DELETE' })
    load()
  }

  if (editing) {
    return <HotelEditor initial={editing} destinations={destinations} onSave={save} onCancel={() => setEditing(null)} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Hotels ({items.length})</h2>
        <button
          onClick={() => setEditing({ _isNew: true, id: '', name: '', destinationId: destinations[0]?.id || '', type: 'Hotel', starRating: 3, description: '', longDescription: '', image: '', priceFrom: 5000, amenities: '[]', rooms: 0 })}
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-full px-4 py-2 hover:bg-stone-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New hotel
        </button>
      </div>
      {loading ? <div className="text-stone-500">Loading…</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((h) => (
            <div key={h.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden flex">
              <div className="w-24 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${h.image as string})` }} />
              <div className="flex-1 p-3">
                <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500">{h.type as string} · {'★'.repeat(h.starRating as number)}</div>
                <h3 className="font-semibold text-stone-950 text-sm">{h.name as string}</h3>
                <p className="text-xs text-stone-500 mt-0.5">₹{Number(h.priceFrom).toLocaleString('en-IN')}/night · {h.destinationId as string}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setEditing(h)} className="text-xs inline-flex items-center gap-1 text-stone-700 hover:text-stone-950"><Edit className="w-3 h-3" />Edit</button>
                  <button onClick={() => del(h.id as string)} className="text-xs inline-flex items-center gap-1 text-red-600 hover:text-red-700"><Trash2 className="w-3 h-3" />Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HotelEditor({ initial, destinations, onSave, onCancel }: { initial: Record<string, unknown>; destinations: Array<{ id: string; name: string }>; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Record<string, unknown>>(initial)
  const set = (k: string, v: unknown) => setForm({ ...form, [k]: v })

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-stone-950 mb-4">{initial._isNew ? 'New hotel' : `Edit ${initial.name}`}</h2>
      <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
        <Field label="ID" value={form.id as string} onChange={(v) => set('id', v)} />
        <Field label="Name" value={form.name as string} onChange={(v) => set('name', v)} />
        <div>
          <Label>Destination</Label>
          <select value={form.destinationId as string} onChange={(e) => set('destinationId', e.target.value)} className={inputCls}>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <Field label="Type" value={form.type as string} onChange={(v) => set('type', v)} />
        <Field label="Star rating (1-5)" type="number" value={String(form.starRating)} onChange={(v) => set('starRating', Number(v))} />
        <Field label="Rooms" type="number" value={String(form.rooms)} onChange={(v) => set('rooms', Number(v))} />
        <Field label="Price from (INR/night)" type="number" value={String(form.priceFrom)} onChange={(v) => set('priceFrom', Number(v))} />
        <div className="sm:col-span-2"><ImageUpload value={form.image as string} onChange={(url) => set('image', url)} /></div>
        <div className="sm:col-span-2"><Label>Description</Label><textarea rows={2} value={form.description as string} onChange={(e) => set('description', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><Label>Long description</Label><textarea rows={4} value={form.longDescription as string} onChange={(e) => set('longDescription', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><Label>Amenities (JSON array)</Label><textarea rows={3} value={form.amenities as string} onChange={(e) => set('amenities', e.target.value)} className={inputCls} /></div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => onSave(form)} className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-5 py-2 text-sm font-medium hover:bg-stone-700 transition-colors"><Check className="w-4 h-4" /> Save</button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 rounded-full px-5 py-2 text-sm font-medium ring-1 ring-stone-300 hover:ring-stone-500 transition-colors"><X className="w-4 h-4" /> Cancel</button>
      </div>
    </div>
  )
}

// ============================================================
// Invoices manager · create, list, download
// ============================================================
function InvoicesManager({ user }: { user: AdminUser }) {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', clientEmail: '', clientPhone: '', packageName: '', amount: 50000, discountPct: 0, taxPct: 5 })

  const load = () => {
    setLoading(true)
    fetch('/api/invoices')
      .then((r) => r.json())
      .then((d) => setItems(d.invoices || []))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, issuedBy: user.name, status: 'draft' }),
    })
    setShowForm(false)
    setForm({ clientName: '', clientEmail: '', clientPhone: '', packageName: '', amount: 50000, discountPct: 0, taxPct: 5 })
    load()
  }

  const download = (inv: Record<string, unknown>) => {
    const w = window.open('', '_blank')
    if (!w) return
    const subtotal = Number(inv.amount)
    const discount = subtotal * Number(inv.discountPct) / 100
    const taxable = subtotal - discount
    const tax = taxable * Number(inv.taxPct) / 100
    w.document.write(`
      <html><head><title>${inv.number}</title>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 40px; color: #1c1917; }
        h1 { font-size: 28px; margin: 0 0 4px 0; }
        h2 { font-size: 14px; color: #57534e; margin: 0 0 24px 0; font-weight: normal; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        td, th { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e7e5e4; font-size: 14px; }
        th { background: #fafaf9; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #57534e; }
        .total { font-weight: 700; font-size: 18px; }
        .right { text-align: right; }
        .meta { display: flex; justify-content: space-between; margin: 24px 0; font-size: 13px; color: #57534e; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #fef3c7; color: #92400e; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; }
      </style></head><body>
      <h1>Eliya Tours And Travels</h1>
      <h2>Malikpora, Magam, Jammu &amp; Kashmir · +91-7006734747 | +91-9419429456 · hello@eliyatours.in</h2>
      <div class="meta">
        <div>
          <div><strong>Invoice:</strong> ${inv.number}</div>
          <div><strong>Date:</strong> ${new Date(inv.createdAt as string).toLocaleDateString('en-IN')}</div>
          <div><strong>Status:</strong> <span class="badge">${inv.status}</span></div>
        </div>
        <div class="right">
          <div><strong>Bill to:</strong></div>
          <div>${inv.clientName}</div>
          ${inv.clientEmail ? `<div>${inv.clientEmail}</div>` : ''}
          ${inv.clientPhone ? `<div>${inv.clientPhone}</div>` : ''}
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th class="right">Amount (INR)</th></tr></thead>
        <tbody>
          <tr><td>${inv.packageName || 'Eliya tour package'}</td><td class="right">₹${subtotal.toLocaleString('en-IN')}</td></tr>
          <tr><td>Discount (${inv.discountPct}%)</td><td class="right">-₹${discount.toLocaleString('en-IN')}</td></tr>
          <tr><td>Tax (${inv.taxPct}%)</td><td class="right">+₹${tax.toLocaleString('en-IN')}</td></tr>
          <tr><td class="total">Total</td><td class="total right">₹${Number(inv.totalAmount).toLocaleString('en-IN')}</td></tr>
        </tbody>
      </table>
      <p style="margin-top: 40px; font-size: 11px; color: #78716c;">Issued by ${inv.issuedBy || user.name}. Valid for 30 days. Payable to Eliya Tours And Travels via bank transfer or UPI. J&amp;K Tourism Reg. No. KT-1903-ELIYA.</p>
      <script>window.print()</script>
      </body></html>
    `)
    w.document.close()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Invoices ({items.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-full px-4 py-2 hover:bg-stone-700 transition-colors">
          <Plus className="w-4 h-4" /> New invoice
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 mb-4 grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">New invoice</div>
          <Field label="Client name" value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} />
          <Field label="Client email" value={form.clientEmail} onChange={(v) => setForm({ ...form, clientEmail: v })} />
          <Field label="Client phone" value={form.clientPhone} onChange={(v) => setForm({ ...form, clientPhone: v })} />
          <Field label="Package name" value={form.packageName} onChange={(v) => setForm({ ...form, packageName: v })} />
          <Field label="Amount (INR)" type="number" value={String(form.amount)} onChange={(v) => setForm({ ...form, amount: Number(v) })} />
          <Field label="Discount %" type="number" value={String(form.discountPct)} onChange={(v) => setForm({ ...form, discountPct: Number(v) })} />
          <Field label="Tax %" type="number" value={String(form.taxPct)} onChange={(v) => setForm({ ...form, taxPct: Number(v) })} />
          <div className="sm:col-span-2 flex items-center gap-2">
            <button type="submit" className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-5 py-2 text-sm font-medium hover:bg-stone-700 transition-colors"><Check className="w-4 h-4" /> Create invoice</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-stone-700 hover:text-stone-950 rounded-full px-5 py-2 text-sm font-medium ring-1 ring-stone-300 hover:ring-stone-500 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-stone-500">Loading…</div> : items.length === 0 ? (
        <div className="text-stone-500 text-sm">No invoices yet. Click &quot;New invoice&quot; to create one.</div>
      ) : (
        <div className="space-y-2">
          {items.map((inv) => (
            <div key={inv.id as string} className="bg-white ring-1 ring-stone-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-stone-950">{inv.number as string}</span>
                  <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-900' :
                    inv.status === 'sent' ? 'bg-blue-100 text-blue-900' :
                    inv.status === 'cancelled' ? 'bg-stone-100 text-stone-600' :
                    'bg-amber-100 text-amber-900'
                  }`}>{inv.status as string}</span>
                </div>
                <div className="text-xs text-stone-500 mt-0.5">{inv.clientName as string} · {new Date(inv.createdAt as string).toLocaleDateString('en-IN')}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums text-stone-950">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-stone-500">{inv.packageName as string || '·'}</div>
                </div>
                <button onClick={() => download(inv)} className="grid place-items-center w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors" aria-label="Download">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Shared field components
// ============================================================
const inputCls = 'w-full bg-stone-50 ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all'

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">{children}</label>
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  )
}

// ============================================================
// Image upload component · drag/drop or click, returns URL
// ============================================================
function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await r.json()
      if (r.ok && data.url) {
        onChange(data.url)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <Label>Image</Label>
      <div className="flex items-start gap-3">
        {value && (
          <div className="w-20 h-20 rounded-xl bg-cover bg-center ring-1 ring-stone-200 shrink-0" style={{ backgroundImage: `url(${value})` }} />
        )}
        <div className="flex-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) upload(f)
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-900 text-amber-50 rounded-full px-3 py-1.5 hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste a URL"
            className={`${inputCls} mt-2`}
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Offers Manager
// ============================================================
function OffersManager() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', code: '', discountPct: 10, validTo: '' })

  const load = () => {
    setLoading(true)
    fetch('/api/offers')
      .then((r) => r.json())
      .then((d) => setItems(d.offers || []))
      .finally(() => setLoading(false))
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const validTo = form.validTo || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, validTo, validFrom: new Date().toISOString() }),
    })
    setShowForm(false)
    setForm({ title: '', description: '', code: '', discountPct: 10, validTo: '' })
    load()
  }

  const toggle = async (id: string, active: boolean) => {
    await fetch('/api/offers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !active }),
    })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this offer?')) return
    await fetch(`/api/offers?id=${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Offers ({items.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-full px-4 py-2 hover:bg-stone-700">
          <Plus className="w-4 h-4" /> New offer
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 mb-4 grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold">New offer</div>
          <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <Field label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} />
          <Field label="Discount %" type="number" value={String(form.discountPct)} onChange={(v) => setForm({ ...form, discountPct: Number(v) })} />
          <Field label="Valid to (date)" type="date" value={form.validTo} onChange={(v) => setForm({ ...form, validTo: v })} />
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-5 py-2 text-sm font-medium hover:bg-stone-700"><Check className="w-4 h-4" /> Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-stone-700 hover:text-stone-950 rounded-full px-5 py-2 text-sm font-medium ring-1 ring-stone-300 hover:ring-stone-500">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-stone-500">Loading…</div> : items.length === 0 ? (
        <div className="text-stone-500 text-sm">No offers yet.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((o) => (
            <div key={o.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-amber-900 bg-amber-100 inline-block px-2 py-0.5 rounded-full font-semibold">{o.discountPct}% OFF</div>
                  <h3 className="font-semibold text-stone-950 text-sm mt-2">{o.title as string}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{o.description as string}</p>
                </div>
              </div>
              <div className="mt-2 font-mono text-xs bg-stone-50 ring-1 ring-stone-200 rounded px-2 py-1 inline-block">{o.code as string}</div>
              <div className="mt-2 text-[10px] text-stone-500">Valid till {new Date(o.validTo as string).toLocaleDateString('en-IN')}</div>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => toggle(o.id as string, o.active as boolean)} className={`text-xs px-2.5 py-1 rounded-full ${o.active ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-stone-100 text-stone-600 ring-1 ring-stone-200'}`}>
                  {o.active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => del(o.id as string)} className="text-xs inline-flex items-center gap-1 text-red-600 hover:text-red-700"><Trash2 className="w-3 h-3" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Reviews Manager · approve/reject + reply
// ============================================================
function ReviewsManager() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')

  const load = () => {
    setLoading(true)
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((d) => setItems(d.reviews || []))
      .finally(() => setLoading(false))
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const approve = async (id: string, approved: boolean) => {
    await fetch('/api/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    })
    load()
  }

  const setReply = async (id: string) => {
    const reply = prompt('Enter your reply:')
    if (!reply) return
    await fetch('/api/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reply, approved: true }),
    })
    load()
  }

  const filtered = items.filter((r) => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Reviews ({items.length})</h2>
        <div className="flex gap-1">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full ring-1 capitalize ${filter === f ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-white text-stone-700 ring-stone-300'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-stone-500">Loading…</div> : filtered.length === 0 ? (
        <div className="text-stone-500 text-sm">No reviews in this filter.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-950 text-sm">{r.guestName as string}</span>
                    <span className="text-amber-500 text-xs">{'★'.repeat(r.rating as number)}</span>
                    {r.approved ? (
                      <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">Approved</span>
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">Pending</span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">{r.guestEmail as string} · {r.destinationId as string || '·'} · {new Date(r.createdAt as string).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="flex gap-2">
                  {!r.approved && (
                    <button onClick={() => approve(r.id as string, true)} className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-200">Approve</button>
                  )}
                  {r.approved && (
                    <button onClick={() => approve(r.id as string, false)} className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 ring-1 ring-stone-200">Unapprove</button>
                  )}
                  <button onClick={() => setReply(r.id as string)} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200">Reply</button>
                </div>
              </div>
              <h4 className="mt-2 text-sm font-medium text-stone-950">{r.title as string}</h4>
              <p className="mt-1 text-sm text-stone-600">{r.body as string}</p>
              {r.reply && (
                <div className="mt-2 p-2 bg-stone-50 rounded text-xs text-stone-700">
                  <strong>Your reply:</strong> {r.reply as string}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Bookings Manager
// ============================================================
function BookingsManager() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((d) => setItems(d.bookings || []))
      .finally(() => setLoading(false))
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  // Real-time sync: refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => load(), 30000)
    return () => clearInterval(interval)
  }, [])

  const markPaid = async (id: string) => {
    const booking = items.find((b) => b.id === id)
    await fetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, paymentStatus: 'paid', paidAmount: booking?.totalAmount }),
    })
    load()
  }

  if (loading) return <div className="text-stone-500">Loading…</div>

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-stone-950 mb-4">Bookings ({items.length})</h2>
      {items.length === 0 ? (
        <div className="text-stone-500 text-sm">No bookings yet. They appear here when guests book via the booking page.</div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-stone-950">{b.reference as string}</span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${
                      b.paymentStatus === 'paid' ? 'bg-green-100 text-green-900' :
                      b.paymentStatus === 'partial' ? 'bg-amber-100 text-amber-900' :
                      'bg-red-100 text-red-900'
                    }`}>{b.paymentStatus as string}</span>
                  </div>
                  <div className="text-sm font-medium text-stone-950 mt-1">{b.packageName as string}</div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {b.guestName as string} · {b.guestEmail as string} · {b.guestPhone as string}
                  </div>
                  <div className="text-xs text-stone-500">
                    {b.startDate as string} → {b.endDate as string} · {b.party as string}
                    {b.discountCode ? ` · Code: ${b.discountCode as string}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold tabular-nums text-stone-950">₹{Number(b.totalAmount).toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-[0.18em]">{b.currency as string} · {b.paymentMethod as string || '·'}</div>
                  {b.paymentStatus !== 'paid' && (
                    <button onClick={() => markPaid(b.id as string)} className="mt-2 text-xs inline-flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-200 px-2.5 py-1 rounded-full">
                      <Check className="w-3 h-3" /> Mark paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Adventures Manager
// ============================================================
function AdventuresManager() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [destinations, setDestinations] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/adventures').then((r) => r.json()),
      fetch('/api/destinations').then((r) => r.json()),
    ])
      .then(([a, d]) => {
        setItems(a.adventures || [])
        setDestinations((d.destinations || []).map((x: Record<string, unknown>) => ({ id: x.id as string, name: x.name as string })))
      })
      .finally(() => setLoading(false))
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const save = async (data: Record<string, unknown>) => {
    if (data._isNew) {
      const { _isNew, ...rest } = data
      await fetch('/api/adventures', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) })
    } else {
      await fetch('/api/adventures', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this adventure?')) return
    await fetch(`/api/adventures?id=${id}`, { method: 'DELETE' })
    load()
  }

  if (editing) {
    return <AdventureEditor initial={editing} destinations={destinations} onSave={save} onCancel={() => setEditing(null)} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Adventures ({items.length})</h2>
        <button
          onClick={() => setEditing({ _isNew: true, id: '', name: '', category: 'Trekking', destinationId: destinations[0]?.id || '', season: '', description: '', longDescription: '', image: '', priceFrom: 5000, duration: '', difficulty: 'Beginner', minAge: 10, maxGroup: 8, gear: '[]', safety: '[]' })}
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-full px-4 py-2 hover:bg-stone-700"
        >
          <Plus className="w-4 h-4" /> New adventure
        </button>
      </div>
      {loading ? <div className="text-stone-500">Loading…</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((a) => (
            <div key={a.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden flex">
              <div className="w-24 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${a.image as string})` }} />
              <div className="flex-1 p-3">
                <div className="text-[10px] uppercase tracking-[0.15em] text-stone-500">{a.category as string}</div>
                <h3 className="font-semibold text-stone-950 text-sm">{a.name as string}</h3>
                <p className="text-xs text-stone-500 mt-0.5">₹{Number(a.priceFrom).toLocaleString('en-IN')} · {a.duration as string}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setEditing(a)} className="text-xs inline-flex items-center gap-1 text-stone-700 hover:text-stone-950"><Edit className="w-3 h-3" />Edit</button>
                  <button onClick={() => del(a.id as string)} className="text-xs inline-flex items-center gap-1 text-red-600 hover:text-red-700"><Trash2 className="w-3 h-3" />Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdventureEditor({ initial, destinations, onSave, onCancel }: { initial: Record<string, unknown>; destinations: Array<{ id: string; name: string }>; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Record<string, unknown>>(initial)
  const set = (k: string, v: unknown) => setForm({ ...form, [k]: v })

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-stone-950 mb-4">{initial._isNew ? 'New adventure' : `Edit ${initial.name}`}</h2>
      <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
        <Field label="ID" value={form.id as string} onChange={(v) => set('id', v)} />
        <Field label="Name" value={form.name as string} onChange={(v) => set('name', v)} />
        <div>
          <Label>Category</Label>
          <select value={form.category as string} onChange={(e) => set('category', e.target.value)} className={inputCls}>
            {['Skiing', 'Trekking', 'Water', 'Air', 'Climbing', 'Cycling', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label>Destination</Label>
          <select value={form.destinationId as string} onChange={(e) => set('destinationId', e.target.value)} className={inputCls}>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <Field label="Season" value={form.season as string} onChange={(v) => set('season', v)} />
        <Field label="Duration" value={form.duration as string} onChange={(v) => set('duration', v)} />
        <Field label="Difficulty" value={form.difficulty as string} onChange={(v) => set('difficulty', v)} />
        <Field label="Min age" type="number" value={String(form.minAge)} onChange={(v) => set('minAge', Number(v))} />
        <Field label="Max group" type="number" value={String(form.maxGroup)} onChange={(v) => set('maxGroup', Number(v))} />
        <Field label="Price from (INR)" type="number" value={String(form.priceFrom)} onChange={(v) => set('priceFrom', Number(v))} />
        <div className="sm:col-span-2"><ImageUpload value={form.image as string} onChange={(url) => set('image', url)} /></div>
        <div className="sm:col-span-2"><Label>Description</Label><textarea rows={2} value={form.description as string} onChange={(e) => set('description', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><Label>Long description</Label><textarea rows={4} value={form.longDescription as string} onChange={(e) => set('longDescription', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><Label>Gear (JSON array)</Label><textarea rows={3} value={form.gear as string} onChange={(e) => set('gear', e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><Label>Safety (JSON array)</Label><textarea rows={3} value={form.safety as string} onChange={(e) => set('safety', e.target.value)} className={inputCls} /></div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => onSave(form)} className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-5 py-2 text-sm font-medium hover:bg-stone-700"><Check className="w-4 h-4" /> Save</button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 rounded-full px-5 py-2 text-sm font-medium ring-1 ring-stone-300 hover:ring-stone-500"><X className="w-4 h-4" /> Cancel</button>
      </div>
    </div>
  )
}

// ============================================================
// Seasonal Pricing Manager
// ============================================================
function PricingManager() {
  const [hotels, setHotels] = useState<Array<{ id: string; name: string; priceFrom: number }>>([])
  const [selected, setSelected] = useState<string>('')
  const [prices, setPrices] = useState<Array<{ month: number; multiplier: number; note: string | null }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hotels')
      .then((r) => r.json())
      .then((d) => {
        setHotels((d.hotels || []).map((h: Record<string, unknown>) => ({ id: h.id as string, name: h.name as string, priceFrom: h.priceFrom as number })))
        if (d.hotels?.[0]) setSelected(d.hotels[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    fetch(`/api/seasonal-pricing?hotelId=${selected}`)
      .then((r) => r.json())
      .then((d) => setPrices(d.prices || []))
      .catch(() => {})
  }, [selected])

  const update = async (month: number, multiplier: number, note?: string) => {
    await fetch('/api/seasonal-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId: selected, month, multiplier, note }),
    })
    // Refresh
    fetch(`/api/seasonal-pricing?hotelId=${selected}`)
      .then((r) => r.json())
      .then((d) => setPrices(d.prices || []))
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const hotel = hotels.find((h) => h.id === selected)
  const getPrice = (month: number) => {
    const p = prices.find((x) => x.month === month)
    return p ? Math.round((hotel?.priceFrom || 0) * p.multiplier) : hotel?.priceFrom || 0
  }
  const getMult = (month: number) => prices.find((x) => x.month === month)?.multiplier || 1.0

  if (loading) return <div className="text-stone-500">Loading…</div>

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-stone-950 mb-4">Seasonal pricing engine</h2>
      <p className="text-sm text-stone-600 mb-4">Set per-month price multipliers for each hotel. The base price is multiplied to compute the actual nightly rate.</p>

      <div className="mb-4">
        <Label>Hotel</Label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className={inputCls}>
          {hotels.map((h) => <option key={h.id} value={h.id}>{h.name} (base ₹{h.priceFrom}/night)</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {months.map((m, i) => {
          const month = i + 1
          const mult = getMult(month)
          const price = getPrice(month)
          return (
            <div key={m} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
              <div className="text-xs uppercase tracking-[0.15em] text-stone-500 font-semibold">{m}</div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-stone-950">₹{price.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-stone-400">{mult}x base</div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={mult}
                onChange={(e) => update(month, Number(e.target.value))}
                className="w-full mt-2 accent-stone-900"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>0.5x</span><span>2x</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// Itineraries Manager · basic drag-drop day planner
// ============================================================
function ItinerariesManager({ user }: { user: AdminUser }) {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([])
  const [destinations, setDestinations] = useState<Array<{ id: string; name: string }>>([])
  const [hotels, setHotels] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/itineraries').then((r) => r.json()),
      fetch('/api/destinations').then((r) => r.json()),
      fetch('/api/hotels').then((r) => r.json()),
    ])
      .then(([it, d, h]) => {
        setItems(it.itineraries || [])
        setDestinations((d.destinations || []).map((x: Record<string, unknown>) => ({ id: x.id as string, name: x.name as string })))
        setHotels((h.hotels || []).map((x: Record<string, unknown>) => ({ id: x.id as string, name: x.name as string })))
      })
      .finally(() => setLoading(false))
  }
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const save = async (data: Record<string, unknown>) => {
    if (data._isNew) {
      const { _isNew, ...rest } = data
      await fetch('/api/itineraries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...rest, createdBy: user.name }) })
    } else {
      await fetch('/api/itineraries', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setEditing(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this itinerary?')) return
    await fetch(`/api/itineraries?id=${id}`, { method: 'DELETE' })
    load()
  }

  if (editing) {
    return <ItineraryEditor initial={editing} destinations={destinations} hotels={hotels} onSave={save} onCancel={() => setEditing(null)} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Itinerary templates ({items.length})</h2>
        <button
          onClick={() => setEditing({ _isNew: true, name: '', description: '', days: '[]', totalCost: 0 })}
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-full px-4 py-2 hover:bg-stone-700"
        >
          <Plus className="w-4 h-4" /> New itinerary
        </button>
      </div>
      {loading ? <div className="text-stone-500">Loading…</div> : items.length === 0 ? (
        <div className="text-stone-500 text-sm">No itineraries yet. Build one with the day planner.</div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => {
            const days = safeJsonParse(it.days, [])
            return (
              <div key={it.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-stone-950 text-sm">{it.name as string}</h3>
                  <p className="text-xs text-stone-500 mt-0.5">{days.length} days · ₹{Number(it.totalCost).toLocaleString('en-IN')} · by {it.createdBy as string || '·'}</p>
                  {it.description && <p className="text-xs text-stone-600 mt-1">{it.description as string}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(it)} className="text-xs inline-flex items-center gap-1 text-stone-700 hover:text-stone-950"><Edit className="w-3 h-3" />Edit</button>
                  <button onClick={() => del(it.id as string)} className="text-xs inline-flex items-center gap-1 text-red-600 hover:text-red-700"><Trash2 className="w-3 h-3" />Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ItineraryEditor({ initial, destinations, hotels, onSave, onCancel }: { initial: Record<string, unknown>; destinations: Array<{ id: string; name: string }>; hotels: Array<{ id: string; name: string }>; onSave: (d: Record<string, unknown>) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial.name as string || '')
  const [description, setDescription] = useState(initial.description as string || '')
  const [days, setDays] = useState<Array<{ destinationId: string; activities: string; hotelId: string; meals: string }>>(
    safeJsonParse(initial.days, [])
  )

  const addDay = () => setDays([...days, { destinationId: destinations[0]?.id || '', activities: '', hotelId: '', meals: 'Breakfast + Dinner' }])
  const removeDay = (i: number) => setDays(days.filter((_, idx) => idx !== i))
  const updateDay = (i: number, field: 'destinationId' | 'activities' | 'hotelId' | 'meals', value: string) => {
    setDays(days.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  const save = () => {
    onSave({
      ...initial,
      name,
      description,
      days: JSON.stringify(days),
      totalCost: days.length * 5000, // simple estimate
    })
  }

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-stone-950 mb-4">{initial._isNew ? 'New itinerary' : `Edit ${initial.name}`}</h2>
      <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 space-y-3">
        <Field label="Itinerary name" value={name} onChange={setName} />
        <div>
          <Label>Description</Label>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
        </div>

        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <Label>Day-by-day plan ({days.length} days)</Label>
            <button onClick={addDay} className="text-xs inline-flex items-center gap-1 bg-stone-900 text-amber-50 rounded-full px-3 py-1.5"><Plus className="w-3 h-3" /> Add day</button>
          </div>
          <div className="space-y-2">
            {days.map((d, i) => (
              <div key={i} className="bg-stone-50 rounded-xl p-3 ring-1 ring-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-700">Day {i + 1}</span>
                  <button onClick={() => removeDay(i)} className="text-xs text-red-600 hover:text-red-700"><X className="w-3 h-3" /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <select value={d.destinationId} onChange={(e) => updateDay(i, 'destinationId', e.target.value)} className={inputCls}>
                    {destinations.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                  <select value={d.hotelId} onChange={(e) => updateDay(i, 'hotelId', e.target.value)} className={inputCls}>
                    <option value="">No hotel</option>
                    {hotels.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                  <input value={d.meals} onChange={(e) => updateDay(i, 'meals', e.target.value)} placeholder="Meals" className={inputCls} />
                  <input value={d.activities} onChange={(e) => updateDay(i, 'activities', e.target.value)} placeholder="Activities (comma-separated)" className={inputCls} />
                </div>
              </div>
            ))}
            {days.length === 0 && <p className="text-xs text-stone-500 text-center py-4">No days yet. Click &quot;Add day&quot; to start planning.</p>}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={save} className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-5 py-2 text-sm font-medium hover:bg-stone-700"><Check className="w-4 h-4" /> Save</button>
        <button onClick={onCancel} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 rounded-full px-5 py-2 text-sm font-medium ring-1 ring-stone-300 hover:ring-stone-500"><X className="w-4 h-4" /> Cancel</button>
      </div>
    </div>
  )
}
