'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Star, ArrowUpRight, Check, Hotel as HotelIcon } from 'lucide-react'
import { useNav } from '@/lib/router'

// ============================================================
// Hotels listing page
// ============================================================

type Hotel = {
  id: string
  name: string
  destinationId: string
  type: string
  starRating: number
  description: string
  longDescription: string | null
  image: string
  priceFrom: number
  amenities: string
  rooms: number
}

type Destination = { id: string; name: string; area: string }

export function HotelsPage() {
  const nav = useNav()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/hotels').then((r) => r.json()),
      fetch('/api/destinations').then((r) => r.json()),
    ])
      .then(([hData, dData]) => {
        if (hData.hotels) setHotels(hData.hotels)
        if (dData.destinations) setDestinations(dData.destinations.map((d: Record<string, unknown>) => ({ id: d.id as string, name: d.name as string, area: d.area as string })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const destName = (id: string) => destinations.find((d) => d.id === id)?.name || id

  const filtered = filter === 'all' ? hotels : hotels.filter((h) => h.destinationId === filter)

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero header */}
      <div className="bg-stone-950 text-amber-50 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <div className="flex items-center gap-3 mb-3">
            <HotelIcon className="w-5 h-5 text-amber-200" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">Eliya-curated stays</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Where you&apos;ll sleep.</h1>
          <p className="mt-3 text-base sm:text-lg text-stone-300 max-w-2xl">
            From cedar houseboats on Nigeen Lake to 5-star heritage palaces and high-altitude camps at Pangong — every property is vetted by our Srinagar team.
          </p>
        </div>
      </div>

      {/* Filter strip */}
      <div className="sticky top-[64px] z-30 bg-stone-50/90 backdrop-blur-xl border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ring-1 transition-all ${
              filter === 'all' ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-transparent text-stone-700 ring-stone-300 hover:ring-stone-500'
            }`}
          >
            All destinations
          </button>
          {destinations
            .filter((d) => hotels.some((h) => h.destinationId === d.id))
            .map((d) => (
              <button
                key={d.id}
                onClick={() => setFilter(d.id)}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ring-1 transition-all capitalize ${
                  filter === d.id ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-transparent text-stone-700 ring-stone-300 hover:ring-stone-500'
                }`}
              >
                {d.name}
              </button>
            ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-stone-500">Loading hotels…</div>
        ) : filtered.length === 0 ? (
          <div className="text-stone-500">No hotels in this filter yet.</div>
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h) => {
              const amenities: string[] = JSON.parse(h.amenities || '[]')
              return (
                <article
                  key={h.id}
                  className="bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden hover:ring-stone-300 transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={h.image} alt={h.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-amber-50 bg-stone-950/55 backdrop-blur-md ring-1 ring-white/15 px-2.5 py-1 rounded-full">
                      {h.type}
                    </div>
                    <div className="absolute top-3 right-3 text-amber-50 bg-stone-950/55 backdrop-blur-md ring-1 ring-white/15 px-2 py-1 rounded-full text-[10px]">
                      {'★'.repeat(h.starRating)}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium">{destName(h.destinationId)}</div>
                    <h3 className="text-lg font-semibold text-stone-950 mt-1 tracking-tight">{h.name}</h3>
                    <p className="mt-2 text-sm text-stone-600 line-clamp-2">{h.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {amenities.slice(0, 4).map((a) => (
                        <span key={a} className="text-[10px] text-stone-600 bg-stone-100 ring-1 ring-stone-200 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                      {amenities.length > 4 && <span className="text-[10px] text-stone-500 px-1">+{amenities.length - 4}</span>}
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-stone-400">From</div>
                        <div className="text-base font-semibold text-stone-950 tabular-nums">₹{h.priceFrom.toLocaleString('en-IN')}<span className="text-xs text-stone-400 font-normal">/night</span></div>
                      </div>
                      <button
                        onClick={() => nav({ name: 'contact' })}
                        className="inline-flex items-center gap-1 text-sm font-medium text-stone-950 hover:gap-1.5 transition-all"
                      >
                        Enquire <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
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
