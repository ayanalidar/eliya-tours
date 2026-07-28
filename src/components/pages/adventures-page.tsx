'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Clock, Users, Mountain, Shield, CalendarDays } from 'lucide-react'
import { useNav } from '@/lib/router'
import { useApp } from '@/lib/app-context'
import { safeStringArray } from '@/lib/safe-parse'

type Adventure = {
  id: string
  name: string
  category: string
  destinationId: string
  season: string
  description: string
  longDescription: string | null
  image: string
  priceFrom: number
  duration: string
  difficulty: string
  minAge: number
  maxGroup: number
  gear: string
  safety: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Adventures' },
  { id: 'Skiing', label: 'Skiing & Snow' },
  { id: 'Trekking', label: 'Trekking' },
  { id: 'Water', label: 'Water Sports' },
  { id: 'Air', label: 'Air Sports' },
  { id: 'Climbing', label: 'Climbing' },
  { id: 'Cycling', label: 'Mountain Biking' },
  { id: 'Other', label: 'Other' },
]

const CATEGORY_ACCENT: Record<string, string> = {
  Skiing: 'oklch(0.85 0.05 240)',
  Trekking: 'oklch(0.55 0.15 165)',
  Water: 'oklch(0.55 0.14 220)',
  Air: 'oklch(0.72 0.13 65)',
  Climbing: 'oklch(0.62 0.18 30)',
  Cycling: 'oklch(0.45 0.10 145)',
  Other: 'oklch(0.50 0.10 200)',
}

export function AdventuresPage() {
  const nav = useNav()
  const { convertPrice } = useApp()
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/adventures')
      .then((r) => r.json())
      .then((d) => setAdventures(d.adventures || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? adventures : adventures.filter((a) => a.category === filter)

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-stone-950 text-amber-50 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Mountain className="w-5 h-5 text-amber-200" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">{adventures.length} adventure sports · Kashmir + Ladakh</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Earn your altitude.</h1>
          <p className="mt-3 text-base sm:text-lg text-stone-300 max-w-2xl">
            From heli-skiing the Pir Panjal to the frozen Zanskar Chadar trek, paragliding at Sanasar, ice-climbing Drung waterfall, and Bactrian camel rides on the Hunder dunes — every adventure is led by certified local guides.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="sticky top-[64px] z-30 bg-stone-50/90 backdrop-blur-xl border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ring-1 transition-all ${
                filter === c.id ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-transparent text-stone-700 ring-stone-300 hover:ring-stone-500'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-stone-500">Loading adventures…</div>
        ) : filtered.length === 0 ? (
          <div className="text-stone-500 text-sm">No adventures in this category yet.</div>
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => {
              const accent = CATEGORY_ACCENT[a.category] || 'oklch(0.62 0.13 165)'
              const gear: string[] = safeStringArray(a.gear)
              return (
                <article
                  key={a.id}
                  onClick={() => nav({ name: 'adventure', id: a.id })}
                  className="group bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden hover:ring-stone-300 transition-all cursor-pointer"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={a.image} alt={a.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />
                    <span
                      className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.18em] font-medium text-white px-2.5 py-1 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: `${accent}`.replace(')', ' / 0.85)').replace('oklch(', 'oklch(') }}
                    >
                      {a.category}
                    </span>
                    <div className="absolute bottom-3 left-4 right-4 text-amber-50">
                      <h3 className="text-lg font-semibold tracking-tight">{a.name}</h3>
                      <p className="text-[11px] text-amber-100/85 capitalize">{a.destinationId.replace(/-/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-stone-600 line-clamp-2">{a.description}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-500">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{a.season}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{a.duration}</span>
                      <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Max {a.maxGroup}</span>
                      <span className="inline-flex items-center gap-1.5"><Mountain className="w-3.5 h-3.5" />{a.difficulty}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {gear.slice(0, 3).map((g) => (
                        <span key={g} className="text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">{g}</span>
                      ))}
                      {gear.length > 3 && <span className="text-[10px] text-stone-500">+{gear.length - 3} more</span>}
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-stone-400">From</div>
                        <div className="text-base font-semibold text-stone-950">{convertPrice(a.priceFrom).formatted}<span className="text-xs text-stone-400 font-normal"> /person</span></div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-950 group-hover:gap-1.5 transition-all">
                        Book this <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
