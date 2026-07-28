'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronDown, MapPin, Star } from 'lucide-react'
import { destinations } from '@/lib/destinations'

// Hero spotlight slides — uses the four most iconic Kashmir scenes.
const heroSlides = destinations.slice(0, 4)

export function SpotlightHero() {
  const [active, setActive] = useState(0)
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 })
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = useCallback((idx: number) => {
    setActive(((idx % heroSlides.length) + heroSlides.length) % heroSlides.length)
  }, [])

  // Auto cross-fade every 6.5 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((p) => (p + 1) % heroSlides.length)
    }, 6500)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Track mouse for spotlight position
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  const current = heroSlides[active]

  return (
    <section
      id="hero"
      ref={containerRef}
      onMouseMove={onMouseMove}
      className="relative h-screen min-h-[680px] w-full overflow-hidden bg-stone-950"
    >
      {/* ===== Cross-fade image layers ===== */}
      {heroSlides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
            idx === active ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${idx === active ? 1.06 : 1.12})`,
            transition: 'opacity 1.4s ease-out, transform 8s ease-out',
          }}
          aria-hidden={idx !== active}
        />
      ))}

      {/* ===== Spotlight that follows cursor ===== */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-[background] duration-300 ease-out"
        style={{
          background: `radial-gradient(680px circle at ${mouse.x * 100}% ${mouse.y * 100}%, rgba(255, 240, 210, 0.18) 0%, rgba(0,0,0,0) 35%), radial-gradient(1400px circle at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.78) 100%)`,
        }}
      />

      {/* ===== Top gradient for header legibility ===== */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent z-10" />
      {/* ===== Bottom gradient for content legibility ===== */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />

      {/* ===== Content ===== */}
      <div className="relative z-20 h-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-32 pb-20 sm:pb-28">
        <div className="max-w-3xl">
          {/* Title */}
          <h1 className="text-balance text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight text-amber-50 opacity-0 animate-[fadeInUp_1.1s_0.35s_forwards]">
            Discover Kashmir
          </h1>

          {/* Crown subtitle */}
          <p className="mt-6 sm:mt-8 text-base sm:text-xl lg:text-2xl font-medium tracking-[0.25em] uppercase text-amber-200/90 opacity-0 animate-[fadeInUp_1.1s_0.5s_forwards]">
            The Crown Of India
          </p>

          {/* Tagline */}
          <p className="mt-4 sm:mt-5 text-lg sm:text-2xl lg:text-3xl font-light italic text-amber-50/90 eliya-shimmer opacity-0 animate-[fadeInUp_1.1s_0.65s_forwards]">
            with the people who call it home.
          </p>

          {/* Subtitle */}
          <p className="mt-8 sm:mt-10 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-stone-200/85 opacity-0 animate-[fadeInUp_1.1s_0.8s_forwards]">
            Bespoke journeys through the Valley — houseboats on Nigeen Lake, powder runs in Gulmarg,
            glacier treks out of Sonmarg, and the hidden meadows of Yusmarg. Curated by Eliya since 2009.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center gap-3 opacity-0 animate-[fadeInUp_1.1s_0.9s_forwards]">
            <a
              href="#destinations"
              className="group inline-flex items-center gap-2 rounded-full bg-amber-50 text-stone-900 px-6 py-3.5 text-sm font-medium hover:bg-white transition-all hover:gap-3"
            >
              Explore destinations
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>
            <a
              href="#tour"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur text-amber-50 ring-1 ring-amber-50/30 px-6 py-3.5 text-sm font-medium hover:bg-white/20 transition-all"
            >
              Take the 360° tour
            </a>
          </div>
        </div>

        {/* ===== Slide indicator + meta strip ===== */}
        <div className="mt-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8 opacity-0 animate-[fadeInUp_1.1s_1.1s_forwards]">
          {/* Slide dots */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => go(idx)}
                  aria-label={`Go to ${slide.name}`}
                  className="group relative"
                >
                  <span
                    className={`block h-[3px] rounded-full transition-all duration-500 ${
                      idx === active ? 'w-12 bg-amber-50' : 'w-6 bg-amber-50/35 group-hover:bg-amber-50/60'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs text-amber-50/70 tabular-nums">
              <span className="text-amber-50 font-medium">0{active + 1}</span>
              <span className="mx-1.5">/</span>
              <span>0{heroSlides.length}</span>
            </div>
          </div>

          {/* Active destination meta */}
          <div className="flex items-center gap-6 text-amber-50">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">Now showing</span>
              <span className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {current.name}
                <span className="text-amber-200/60 font-normal">· {current.region}</span>
              </span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">Rating</span>
              <span className="text-sm font-medium mt-0.5 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {current.stats.rating.toFixed(1)}
              </span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">Elevation</span>
              <span className="text-sm font-medium mt-0.5">{current.elevation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-amber-50/70 text-[10px] uppercase tracking-[0.3em] animate-pulse">
        <span>Scroll</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>

      {/* Keyframes for fade-in-up — inline so Tailwind doesn't purge them */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
