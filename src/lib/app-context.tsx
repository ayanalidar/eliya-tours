'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

// ============================================================
// Global app context · currency, language, notifications, toasts
// ============================================================

type CurrencyInfo = { code: string; symbol: string; rate: number; name: string }
type Language = 'en' | 'hi' | 'ur'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

type Toast = { id: string; title: string; message?: string; type: 'success' | 'error' | 'info' }

type AppContextValue = {
  // Currency
  currency: CurrencyInfo
  setCurrency: (c: CurrencyInfo) => void
  currencies: Record<string, CurrencyInfo>
  convertPrice: (inr: number) => { amount: number; formatted: string }
  // Language
  language: Language
  setLanguage: (l: Language) => void
  t: (en: string, hi?: string, ur?: string) => string
  // Notifications
  notifications: Notification[]
  unreadCount: number
  refreshNotifications: () => Promise<void>
  markAllRead: () => Promise<void>
  // Toasts
  toasts: Toast[]
  pushToast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const DEFAULT_CURRENCIES: Record<string, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', rate: 1, name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', rate: 0.012, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011, name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0094, name: 'British Pound' },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(DEFAULT_CURRENCIES.INR)
  const [currencies, setCurrencies] = useState<Record<string, CurrencyInfo>>(DEFAULT_CURRENCIES)
  const [language, setLanguageState] = useState<Language>('en')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Load persisted currency + language
  useEffect(() => {
    try {
      const savedCur = localStorage.getItem('eliya-currency')
      if (savedCur) {
        const parsed = JSON.parse(savedCur)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrencyState(parsed)
      }
      const savedLang = localStorage.getItem('eliya-language') as Language | null
      if (savedLang && ['en', 'hi', 'ur'].includes(savedLang)) {
        setLanguageState(savedLang)
      }
    } catch {
      // ignore
    }
  }, [])

  // Fetch currency rates on mount (and refresh daily)
  useEffect(() => {
    fetch('/api/currency?base=INR')
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) {
          const next: Record<string, CurrencyInfo> = {}
          for (const [code, info] of Object.entries(data.rates) as [string, CurrencyInfo][]) {
            next[code] = info
          }
          setCurrencies(next)
          // Update current currency rate if same code
          setCurrencyState((prev) => next[prev.code] || prev)
        }
      })
      .catch(() => {})
  }, [])

  // Poll notifications every 30s (only when tab is visible)
  const refreshNotifications = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications?limit=20')
      if (!r.ok) return
      const data = await r.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // not logged in · silent
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshNotifications()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshNotifications()
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [refreshNotifications])

  const setCurrency = useCallback((c: CurrencyInfo) => {
    setCurrencyState(c)
    try { localStorage.setItem('eliya-currency', JSON.stringify(c)) } catch {}
  }, [])

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l)
    try { localStorage.setItem('eliya-language', l) } catch {}
  }, [])

  const t = useCallback((en: string, hi?: string, ur?: string) => {
    if (language === 'hi' && hi) return hi
    if (language === 'ur' && ur) return ur
    return en
  }, [language])

  const convertPrice = useCallback((inr: number) => {
    const converted = inr * currency.rate
    let formatted: string
    if (currency.code === 'INR') {
      formatted = `${currency.symbol}${Math.round(converted).toLocaleString('en-IN')}`
    } else {
      formatted = `${currency.symbol}${converted.toFixed(0)}`
    }
    return { amount: converted, formatted }
  }, [currency])

  const markAllRead = useCallback(async () => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    refreshNotifications()
  }, [refreshNotifications])

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { ...toast, id }])
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <AppContext.Provider
      value={{
        currency, setCurrency, currencies, convertPrice,
        language, setLanguage, t,
        notifications, unreadCount, refreshNotifications, markAllRead,
        toasts, pushToast, dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
