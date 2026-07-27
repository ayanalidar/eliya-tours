'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Calendar, Clock, Star, ArrowUpRight, MapPin } from 'lucide-react'
import { useNav } from '@/lib/router'

type Season = {
  id: string
  season: string
  months: string
  title: string
  theme: string
  description: string
  image: string
  color: string
  priceFrom: number
  duration: string
  isFeatured: boolean
  destinations: string
}

export function SeasonsPage() {
  const nav = useNav()
  const [seasons, setSeasons] = useState<Season[]>([])

  useEffect(() => {
    fetch('/api/seasons')
      .then((r) => r.json())
      .then((d) => setSeasons(d.seasons || []))
      .catch(() => {})
  }, [])

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-stone-950 text-amber-50 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-amber-200" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">The Kashmir year</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">From first tulip to last powder.</h1>
          <p className="mt-3 text-base sm:text-lg text-stone-300 max-w-2xl">
            Six seasonal packages spanning the Kashmir + Ladakh calendar. Click any season to see the day-by-day plan, included destinations, and starting price.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {seasons.map((s) => {
            const destIds: string[] = JSON.parse(s.destinations || '[]')
            return (
              <article
                key={s.id}
                onClick={() => nav({ name: 'season', id: s.id })}
                className="group bg-white ring-1 ring-stone-200 rounded-3xl overflow-hidden hover:ring-stone-300 transition-all cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={s.image} alt={s.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${s.color}25, transparent 60%)` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent" />
                  {s.isFeatured && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] font-medium text-stone-950 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-current" /> Signature
                    </span>
                  )}
                  <div className="absolute bottom-3 left-4 right-4 text-amber-50">
                    <p className="text-[10px] uppercase tracking-[0.22em] font-medium" style={{ color: s.color }}>{s.season} · {s.months}</p>
                    <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium">{s.theme}</p>
                  <p className="mt-2 text-sm text-stone-600 line-clamp-3">{s.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{s.duration}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{destIds.length} destinations</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-stone-400">From</div>
                      <div className="text-base font-semibold text-stone-950 tabular-nums">₹{s.priceFrom.toLocaleString('en-IN')}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-950 group-hover:gap-1.5 transition-all">
                      View season <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
