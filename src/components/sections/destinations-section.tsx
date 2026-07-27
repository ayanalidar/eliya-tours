'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Mountain, CalendarDays, Gauge, MapPin } from 'lucide-react'
import { useNav } from '@/lib/router'
import { destinations as fallbackDestinations, type Destination } from '@/lib/destinations'

// ============================================================
// New destinations section — destinations grouped by area,
// no magnifier. Pulls from /api/destinations (DB) with
// fallback to static data.
// ============================================================

const AREA_DESCRIPTIONS: Record<string, { title: string; subtitle: string }> = {
  'Kashmir Valley': { title: 'Kashmir Valley', subtitle: 'Srinagar, Dal, Pampore, Sonmarg & Gurez — the heart of the Valley' },
  'Pir Panjal Range': { title: 'Pir Panjal Range', subtitle: 'Gulmarg, Tangmarg, Yusmarg & Lolab — the western mountains' },
  'Lidder Valley': { title: 'Lidder Valley', subtitle: 'Pahalgam & Aru — pine forests and the great Himalayan wall' },
  'Zabarwan Range': { title: 'Zabarwan Range', subtitle: 'Dachigam — wilderness on Srinagar\'s doorstep' },
  'Jammu Region': { title: 'Jammu Region', subtitle: 'Vaishno Devi & Patnitop — pilgrimage and plateau meadows' },
  'Ladakh': { title: 'Ladakh', subtitle: 'Leh, Nubra, Pangong, Kargil, Zanskar & Tso Moriri — trans-Himalaya' },
}

export function DestinationsSection() {
  const nav = useNav()
  const [destinations, setDestinations] = useState<Destination[]>(fallbackDestinations)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data) => {
        if (data.destinations && data.destinations.length > 0) {
          // Map DB rows to client shape
          const mapped: Destination[] = data.destinations.map((d: Record<string, unknown>) => ({
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
            stats: {
              rating: d.rating as number,
              visitors: d.visitors as number,
              curated: d.curated as number,
              safety: d.safety as number,
            },
            highlights: JSON.parse((d.highlights as string) || '[]'),
          }))
          setDestinations(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Group destinations by area
  const grouped = destinations.reduce<Record<string, Destination[]>>((acc, d) => {
    if (!acc[d.area]) acc[d.area] = []
    acc[d.area].push(d)
    return acc
  }, {})

  const areas = Object.keys(grouped)

  return (
    <section id="destinations" className="relative bg-stone-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-stone-900" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-stone-500 font-medium">
              {destinations.length} destinations · Kashmir + Ladakh
            </span>
          </div>
          <h2 className="text-balance text-3xl sm:text-5xl font-semibold tracking-tight text-stone-950 leading-[1.1]">
            Every valley.
            <span className="italic font-light text-stone-500"> One local team.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-600 max-w-2xl">
            From the floating vegetable market on Dal Lake to the frozen Zanskar river, every Eliya
            destination is grouped by its natural region — click any card to open the full destination
            guide with weather, hotels, itinerary and pricing.
          </p>
        </div>

        {/* Grouped destinations */}
        <div className="mt-12 space-y-16">
          {areas.map((area) => {
            const dests = grouped[area]
            const meta = AREA_DESCRIPTIONS[area] || { title: area, subtitle: '' }
            return (
              <div key={area}>
                {/* Area header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5 pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-stone-950">
                      {meta.title}
                    </h3>
                    <p className="text-sm text-stone-500 mt-0.5">{meta.subtitle}</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-stone-400 font-medium">
                    {dests.length} {dests.length === 1 ? 'destination' : 'destinations'}
                  </span>
                </div>

                {/* Cards grid */}
                <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {dests.map((d) => (
                    <DestinationCard key={d.id} destination={d} onClick={() => nav({ name: 'destination', id: d.id })} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 border-t border-stone-200">
          <p className="text-sm text-stone-600">
            Want a route that crosses regions? Try our{' '}
            <button onClick={() => nav({ name: 'seasons' })} className="text-stone-950 font-medium underline-offset-2 hover:underline">
              seasonal packages
            </button>{' '}
            or ask the{' '}
            <button onClick={() => nav({ name: 'ai-guide' })} className="text-stone-950 font-medium underline-offset-2 hover:underline">
              AI guide
            </button>{' '}
            to design one.
          </p>
          <button
            onClick={() => nav({ name: 'contact' })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-950 hover:gap-2.5 transition-all"
          >
            Request a custom route
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Destination card — no magnifier, click to navigate
// ============================================================
function DestinationCard({ destination, onClick }: { destination: Destination; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: -y * 4, y: x * 4 })
  }

  const onMouseLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <button
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-stone-900 text-left cursor-pointer"
      style={{ '--accent': destination.accent, transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.2s ease-out' } as React.CSSProperties}
    >
      {/* Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${destination.image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/35 to-transparent" />

      {/* Top tags */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between">
        <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] text-amber-50 bg-black/40 backdrop-blur-md ring-1 ring-white/15 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: destination.accent }} />
          {destination.region}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-amber-50/85 bg-black/40 backdrop-blur-md ring-1 ring-white/15 px-2.5 py-1 rounded-full">
          {destination.elevation}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/80 font-medium mb-2">
          {destination.tagline}
        </p>
        <h3 className="text-2xl sm:text-3xl font-semibold text-amber-50 tracking-tight">
          {destination.name}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-stone-200/85 line-clamp-2 max-w-md">
          {destination.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-stone-300">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-amber-200/70" />
            {destination.bestSeason}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-200/70" />
            {destination.stats.rating.toFixed(1)} ★
          </span>
        </div>

        {/* CTA */}
        <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-amber-50 group-hover:gap-2.5 transition-all">
          View destination guide
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  )
}
