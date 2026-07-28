'use client'

import { useEffect, useState } from 'react'
import { Menu, X, LogIn } from 'lucide-react'
import { useNav } from '@/lib/router'

const navItems = [
  { label: 'Home', route: { name: 'home' as const } },
  { label: 'Destinations', route: { name: 'destinations' as const } },
  { label: 'Adventures', route: { name: 'adventures' as const } },
  { label: 'Seasons', route: { name: 'seasons' as const } },
  { label: 'Hotels', route: { name: 'hotels' as const } },
  { label: 'Tickets', route: { name: 'tickets' as const } },
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
          className="flex items-center gap-2 group"
        >
          <img src="/logo.png" alt="Eliya Tours" className="h-8 sm:h-9 w-auto object-contain" />
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

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => nav({ name: 'admin' })}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ring-1 transition-all ${
              useLightHeader
                ? 'text-amber-50/85 hover:text-amber-50 ring-amber-50/30 hover:bg-amber-50/10'
                : 'text-stone-600 hover:text-stone-900 ring-stone-300 hover:bg-stone-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Login
          </button>
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
              Plan my trip · +91-7006734747
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
