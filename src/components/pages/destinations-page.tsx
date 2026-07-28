'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, MapPin, Mountain, CalendarDays, Star } from 'lucide-react'
import { useNav } from '@/lib/router'
import { destinations as fallbackDestinations, type Destination } from '@/lib/destinations'
import { safeStringArray } from '@/lib/safe-parse'

const AREA_DESCRIPTIONS: Record<string, string> = {
  'Kashmir Valley': 'Srinagar, Dal, Pampore, Sonmarg & Gurez — the heart of the Valley',
  'Pir Panjal Range': 'Gulmarg, Tangmarg, Yusmarg & Lolab — the western mountains',
  'Lidder Valley': 'Pahalgam & Aru — pine forests and the great Himalayan wall',
  'Zabarwan Range': 'Dachigam — wilderness on Srinagar\'s doorstep',
  'Jammu Region': 'Vaishno Devi & Patnitop — pilgrimage and plateau meadows',
  'Ladakh': 'Leh, Nubra, Pangong, Kargil, Zanskar & Tso Moriri — trans-Himalaya',
}

export function DestinationsPage() {
  const nav = useNav()
  const [destinations, setDestinations] = useState<Destination[]>(fallbackDestinations)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data) => {
        if (data.destinations && data.destinations.length > 0) {
          setDestinations(data.destinations.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            name: d.name as string,
            region: d.region as string,
            area: d.area as string,
            elevation: d.elevation as string,
            bestSeason: d.bestSeason as string,
            tagline: d.tagline as string,
            description: d.description as string,
            longDescription: d.longDescription as string,
            image: d.image as string,
            accent: d.accent as string,
            latitude: d.latitude as number,
            longitude: d.longitude as number,
            stats: { rating: d.rating as number, visitors: d.visitors as number, curated: d.curated as number, safety: d.safety as number },
            highlights: safeStringArray(d.highlights),
          })))
        }
      })
      .catch(() => {})
  }, [])

  const grouped = destinations.reduce<Record<string, Destination[]>>((acc, d) => {
    if (!acc[d.area]) acc[d.area] = []
    acc[d.area].push(d)
    return acc
  }, {})
  const areas = Object.keys(grouped).filter((a) => filter === 'all' || a === filter)

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-stone-950 text-amber-50 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-amber-200" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">{destinations.length} destinations · Kashmir + Ladakh</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Every valley. One local team.</h1>
          <p className="mt-3 text-base sm:text-lg text-stone-300 max-w-2xl">
            From the floating vegetable market on Dal Lake to the frozen Zanskar river — every Eliya destination grouped by its natural region.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="sticky top-[64px] z-30 bg-stone-50/90 backdrop-blur-xl border-b border-stone-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ring-1 transition-all ${filter === 'all' ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-transparent text-stone-700 ring-stone-300 hover:ring-stone-500'}`}
          >
            All regions
          </button>
          {Object.keys(grouped).map((a) => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ring-1 transition-all ${filter === a ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-transparent text-stone-700 ring-stone-300 hover:ring-stone-500'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {areas.map((area) => {
          const dests = grouped[area]
          return (
            <div key={area}>
              <div className="mb-5 pb-3 border-b border-stone-200">
                <h2 className="text-2xl font-semibold tracking-tight text-stone-950">{area}</h2>
                <p className="text-sm text-stone-500 mt-0.5">{AREA_DESCRIPTIONS[area] || ''}</p>
              </div>
              <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {dests.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => nav({ name: 'destination', id: d.id })}
                    className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-stone-900 text-left"
                    style={{ '--accent': d.accent } as React.CSSProperties}
                  >
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${d.image})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/35 to-transparent" />
                    <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between">
                      <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] text-amber-50 bg-black/40 backdrop-blur-md ring-1 ring-white/15 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: d.accent }} />
                        {d.region}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-amber-50/85 bg-black/40 backdrop-blur-md ring-1 ring-white/15 px-2.5 py-1 rounded-full">
                        {d.elevation}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 z-20 p-5">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/80 font-medium mb-2">{d.tagline}</p>
                      <h3 className="text-2xl font-semibold text-amber-50 tracking-tight">{d.name}</h3>
                      <p className="mt-2 text-sm text-stone-200/85 line-clamp-2">{d.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-300">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-amber-200/70" />{d.bestSeason}</span>
                        <span className="inline-flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />{d.stats.rating.toFixed(1)}</span>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-amber-50 group-hover:gap-2.5 transition-all">
                        View destination guide <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
