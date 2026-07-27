'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, Check, Globe, DollarSign, X, ChevronDown } from 'lucide-react'
import { useApp } from '@/lib/app-context'

// ============================================================
// Utility bar — currency switcher, language switcher, notifications bell
// Renders in the header on desktop, in a drawer on mobile
// ============================================================

export function UtilityBar({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { currency, setCurrency, currencies, language, setLanguage, notifications, unreadCount, markAllRead } = useApp()
  const [curOpen, setCurOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const curRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (curRef.current && !curRef.current.contains(target)) setCurOpen(false)
      if (langRef.current && !langRef.current.contains(target)) setLangOpen(false)
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const light = variant === 'light'

  return (
    <div className="flex items-center gap-1.5">
      {/* Currency switcher */}
      <div className="relative" ref={curRef}>
        <button
          onClick={() => { setCurOpen(!curOpen); setLangOpen(false); setNotifOpen(false) }}
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full ring-1 transition-colors ${
            light ? 'text-stone-700 ring-stone-300 hover:bg-stone-100' : 'text-amber-50/85 ring-amber-50/30 hover:bg-amber-50/10'
          }`}
          aria-label="Currency"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>{currency.code}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        {curOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl ring-1 ring-stone-200 py-1 z-50">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold">Currency</div>
            {Object.values(currencies).map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c); setCurOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-stone-50 ${
                  currency.code === c.code ? 'text-stone-950 font-medium' : 'text-stone-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 text-stone-500">{c.symbol}</span>
                  <span>{c.code}</span>
                  <span className="text-xs text-stone-400">{c.name}</span>
                </span>
                {currency.code === c.code && <Check className="w-3.5 h-3.5 text-green-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language switcher */}
      <div className="relative" ref={langRef}>
        <button
          onClick={() => { setLangOpen(!langOpen); setCurOpen(false); setNotifOpen(false) }}
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full ring-1 transition-colors ${
            light ? 'text-stone-700 ring-stone-300 hover:bg-stone-100' : 'text-amber-50/85 ring-amber-50/30 hover:bg-amber-50/10'
          }`}
          aria-label="Language"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="uppercase">{language}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        {langOpen && (
          <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl ring-1 ring-stone-200 py-1 z-50">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold">Language</div>
            {[
              { code: 'en' as const, label: 'English', sub: 'English' },
              { code: 'hi' as const, label: 'हिन्दी', sub: 'Hindi' },
              { code: 'ur' as const, label: 'اردگو', sub: 'Urdu' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => { setLanguage(l.code); setLangOpen(false) }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-stone-50 ${
                  language === l.code ? 'text-stone-950 font-medium' : 'text-stone-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{l.label}</span>
                  <span className="text-xs text-stone-400">{l.sub}</span>
                </span>
                {language === l.code && <Check className="w-3.5 h-3.5 text-green-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notification bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setNotifOpen(!notifOpen); setCurOpen(false); setLangOpen(false) }}
          className={`relative grid place-items-center w-9 h-9 rounded-full ring-1 transition-colors ${
            light ? 'text-stone-700 ring-stone-300 hover:bg-stone-100' : 'text-amber-50/85 ring-amber-50/30 hover:bg-amber-50/10'
          }`}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center bg-red-500 text-white text-[9px] font-bold rounded-full ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl ring-1 ring-stone-200 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
              <div className="text-sm font-semibold text-stone-950">Notifications</div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[11px] text-stone-500 hover:text-stone-950 inline-flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-stone-400">No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <a
                    key={n.id}
                    href={n.link || '#'}
                    className={`block px-4 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors ${!n.read ? 'bg-amber-50/40' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${!n.read ? 'bg-amber-500' : 'bg-stone-300'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-950 truncate">{n.title}</div>
                        <div className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-[10px] text-stone-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Toast container — renders all toasts (success/error/info)
// ============================================================
export function ToastContainer() {
  const { toasts, dismissToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 px-4 w-full max-w-md pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full flex items-start gap-3 rounded-2xl shadow-xl ring-1 px-4 py-3 ${
            t.type === 'success' ? 'bg-green-50 ring-green-200 text-green-900' :
            t.type === 'error' ? 'bg-red-50 ring-red-200 text-red-900' :
            'bg-white ring-stone-200 text-stone-900'
          }`}
        >
          <div className="flex-1">
            <div className="text-sm font-medium">{t.title}</div>
            {t.message && <div className="text-xs mt-0.5 opacity-80">{t.message}</div>}
          </div>
          <button onClick={() => dismissToast(t.id)} className="opacity-50 hover:opacity-100" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
