'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Star, ArrowUpRight } from 'lucide-react'
import { genreTimeline } from '@/lib/destinations'
import { useApp } from '@/lib/app-context'

export function GenreTimelineSection() {
  const { convertPrice } = useApp()
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [activeIdx, setActiveIdx] = useState(0)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)

    // figure out which card is "centred" in the viewport
    const center = el.scrollLeft + el.clientWidth / 2
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-tl-card]'))
    let nearest = 0
    let nearestDist = Infinity
    cards.forEach((card, idx) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2
      const d = Math.abs(cardCenter - center)
      if (d < nearestDist) {
        nearestDist = d
        nearest = idx
      }
    })
    setActiveIdx(nearest)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    updateArrows()
    return () => el.removeEventListener('scroll', updateArrows)
  }, [updateArrows])

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: 'smooth' })
  }

  // Compute progress percentage (0-100) of horizontal scroll
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth
      setProgress(max > 0 ? (el.scrollLeft / max) * 100 : 0)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="seasons" className="relative bg-stone-950 text-amber-50 py-20 sm:py-28 overflow-hidden">
      {/* Subtle backdrop */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,200,100,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(120,200,180,0.3) 0%, transparent 40%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-amber-300/80" />
              <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">
                The Kashmir year · a six-act journey
              </span>
            </div>
            <h2 className="text-balance text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
              From the first tulip to the last powder.
            </h2>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-300">
              Scroll sideways through the Kashmir calendar. Each season reveals a different valley ·
              spring blossoms, summer alpine lakes, autumn chinar gold, winter powder · plus our
              year-round houseboat heritage stays.
            </p>
          </div>

          {/* Arrow controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canLeft}
              aria-label="Scroll timeline left"
              className={`grid place-items-center w-11 h-11 rounded-full ring-1 transition-all ${
                canLeft
                  ? 'bg-amber-50/10 hover:bg-amber-50/20 ring-amber-50/30 text-amber-50'
                  : 'bg-transparent ring-amber-50/10 text-amber-50/30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canRight}
              aria-label="Scroll timeline right"
              className={`grid place-items-center w-11 h-11 rounded-full ring-1 transition-all ${
                canRight
                  ? 'bg-amber-50/10 hover:bg-amber-50/20 ring-amber-50/30 text-amber-50'
                  : 'bg-transparent ring-amber-50/10 text-amber-50/30 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Horizontal scroll track ===== */}
      <div
        ref={trackRef}
        className="relative mt-12 flex gap-5 sm:gap-7 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-6"
        style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
      >
        {/* Year-axis line · runs behind the cards */}
        <div className="pointer-events-none absolute top-[170px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-50/15 to-transparent" />

        {genreTimeline.map((era, idx) => {
          const isActive = idx === activeIdx
          return (
            <article
              key={era.id}
              data-tl-card
              className={`snap-start shrink-0 w-[280px] sm:w-[340px] lg:w-[380px] transition-all duration-500 ${
                isActive ? 'opacity-100' : 'opacity-65 hover:opacity-90'
              }`}
            >
              {/* Year-axis node */}
              <div className="relative flex flex-col items-center mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-amber-200/80 font-medium">
                  {era.season}
                </div>
                <div className="mt-1.5 text-xs text-amber-50/60 tabular-nums">{era.months}</div>
                {/* node dot */}
                <div className="relative mt-3 mb-4">
                  <span
                    className="block w-3 h-3 rounded-full ring-4 ring-stone-950 transition-colors"
                    style={{ backgroundColor: isActive ? era.color : 'rgba(255,255,255,0.35)' }}
                  />
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full eliya-pulse-ring"
                      style={{ backgroundColor: era.color }}
                    />
                  )}
                </div>
              </div>

              {/* Card */}
              <div
                className="relative rounded-3xl overflow-hidden bg-stone-900 ring-1 ring-amber-50/10 eliya-shadow-deep"
                style={
                  isActive
                    ? { boxShadow: `0 0 0 1px ${era.color}, 0 24px 60px -20px rgba(0,0,0,0.6)` }
                    : undefined
                }
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={era.image}
                    alt={`${era.season} · ${era.title}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent" />

                  {/* featured ribbon */}
                  {era.isFeatured && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] font-medium text-stone-950 bg-amber-50/95 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Signature
                    </span>
                  )}

                  {/* price */}
                  <div className="absolute bottom-3 right-3 text-right">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200/80">From</div>
                    <div className="text-base font-semibold text-amber-50 tabular-nums">
                      {convertPrice(era.priceFrom).formatted}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-amber-50 tracking-tight">
                    {era.title}
                  </h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-amber-200/70">
                    {era.theme}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300 line-clamp-4">
                    {era.description}
                  </p>

                  {/* Meta */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-stone-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-200/60" />
                      {era.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-200/60" />
                      {era.destinations.join(' · ')}
                    </span>
                  </div>

                  {/* CTA */}
                  <a
                    href={`#/seasons/${era.id}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-amber-50 hover:text-amber-200 transition-colors group/cta"
                  >
                    View this season
                    <ArrowUpRight className="w-4 h-4 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </article>
          )
        })}

        {/* trailing spacer so last card can snap-start cleanly */}
        <div className="shrink-0 w-1" />
      </div>

      {/* ===== Progress bar + count ===== */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-amber-200/70 mb-2">
          <span>Timeline · {genreTimeline.length} seasons</span>
          <span className="tabular-nums">
            {String(activeIdx + 1).padStart(2, '0')} / {String(genreTimeline.length).padStart(2, '0')}
          </span>
        </div>
        <div className="relative h-[2px] w-full bg-amber-50/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-amber-50/70 rounded-full transition-[width] duration-300"
            style={{ width: `${Math.max(8, progress)}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Tip: scroll sideways, or use ← → arrow keys to navigate the seasons.</span>
        </div>
      </div>
    </section>
  )
}
