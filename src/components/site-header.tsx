'use client'

import { useEffect, useState } from 'react'
import { Menu, X, Mountain } from 'lucide-react'
import { useNav } from '@/lib/router'
import { UtilityBar } from '@/components/utility-bar'

const navItems = [
  { label: 'Home', route: { name: 'home' as const } },
  { label: 'Destinations', route: { name: 'destinations' as const } },
  { label: 'Adventures', route: { name: 'adventures' as const } },
  { label: 'Seasons', route: { name: 'seasons' as const } },
  { label: 'Hotels', route: { name: 'hotels' as const } },
  { label: 'AI Guide', route: { name: 'ai-guide' as const } },
  { label: 'Contact', route: { name: 'contact' as const } },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [isHome, setIsHome] = useState(true) // start true to match SSR for the home page
  const nav = useNav()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const onHash = () => {
      setIsHome(window.location.hash === '' || window.location.hash === '#/')
    }
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  const useLightHeader = isHome && !scrolled

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        useLightHeader
          ? 'bg-transparent py-5'
          : 'bg-stone-50/90 backdrop-blur-xl border-b border-stone-200/70 py-3'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          onClick={() => nav({ name: 'home' })}
          className="flex items-center gap-2.5 group"
        >
          <span
            className={`grid place-items-center w-9 h-9 rounded-full transition-colors ${
              useLightHeader
                ? 'bg-amber-50/15 backdrop-blur text-amber-50 ring-1 ring-amber-50/30'
                : 'bg-stone-900 text-amber-50'
            }`}
          >
            <Mountain className="w-5 h-5" strokeWidth={2.2} />
          </span>
          <div className="flex flex-col leading-tight">
            <span
              className={`text-sm font-semibold tracking-tight transition-colors ${
                useLightHeader ? 'text-amber-50' : 'text-stone-900'
              }`}
            >
              Eliya Tours
            </span>
            <span
              className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${
                useLightHeader ? 'text-amber-100/80' : 'text-stone-500'
              }`}
            >
              And Travels · Kashmir
            </span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => nav(item.route)}
              className={`px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                useLightHeader
                  ? 'text-amber-50/85 hover:text-amber-50 hover:bg-amber-50/10'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <UtilityBar variant={useLightHeader ? 'dark' : 'light'} />
          <button
            onClick={() => nav({ name: 'contact' })}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${
              useLightHeader
                ? 'bg-amber-50 text-stone-900 hover:bg-white'
                : 'bg-stone-900 text-amber-50 hover:bg-stone-700'
            }`}
          >
            Plan my trip
          </button>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className={`md:hidden p-2 rounded-full transition-colors ${
            useLightHeader ? 'text-amber-50 hover:bg-amber-50/10' : 'text-stone-900 hover:bg-stone-100'
          }`}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-stone-50 border-b border-stone-200 px-4 py-4 shadow-xl">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { nav(item.route); setOpen(false) }}
                className="px-3 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg text-left"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { nav({ name: 'admin' }); setOpen(false) }}
              className="px-3 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-100 rounded-lg text-left"
            >
              Admin login
            </button>
            <button
              onClick={() => { nav({ name: 'contact' }); setOpen(false) }}
              className="mt-2 px-3 py-2.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-lg"
            >
              Plan my trip · +91 94190 12345
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
