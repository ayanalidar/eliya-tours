'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Tag, Clock, Check, Copy, ArrowUpRight } from 'lucide-react'
import { useNav } from '@/lib/router'
import { useApp } from '@/lib/app-context'

type Offer = {
  id: string
  title: string
  description: string
  code: string
  discountPct: number
  validFrom: string
  validTo: string
  active: boolean
}

export function OffersPage() {
  const nav = useNav()
  const { pushToast } = useApp()
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    fetch('/api/offers')
      .then((r) => r.json())
      .then((d) => setOffers(d.offers || []))
      .catch(() => {})
  }, [])

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    pushToast({ type: 'success', title: 'Code copied', message: `${code} · paste it at checkout` })
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="bg-stone-950 text-amber-50 pt-24 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <div className="flex items-center gap-3 mb-3">
            <Tag className="w-5 h-5 text-amber-200" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">Active offers · {offers.length}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Save on your trip.</h1>
          <p className="mt-3 text-base sm:text-lg text-stone-300 max-w-2xl">
            Active promo codes for Eliya Tours packages. Click any code to copy, then paste it at checkout.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {offers.length === 0 ? (
          <div className="text-stone-500 text-sm">No active offers right now. Check back soon!</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {offers.map((o) => {
              const daysLeft = Math.ceil((new Date(o.validTo).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
              return (
                <div key={o.id} className="bg-white ring-1 ring-stone-200 rounded-3xl p-6 relative overflow-hidden">
                  {/* Decorative corner */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-100/50" />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-semibold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full">
                          {o.discountPct}% OFF
                        </span>
                        <h3 className="mt-3 text-lg font-semibold text-stone-950">{o.title}</h3>
                        <p className="text-sm text-stone-600 mt-1">{o.description}</p>
                      </div>
                    </div>

                    {/* Code */}
                    <button
                      onClick={() => copyCode(o.code)}
                      className="mt-4 w-full flex items-center justify-between gap-3 bg-stone-50 ring-1 ring-stone-200 hover:ring-stone-400 rounded-xl px-4 py-3 transition-all group"
                    >
                      <span className="font-mono text-base font-semibold tracking-[0.15em] text-stone-950">{o.code}</span>
                      <span className="text-xs text-stone-500 inline-flex items-center gap-1 group-hover:text-stone-900">
                        <Copy className="w-3 h-3" /> Copy
                      </span>
                    </button>

                    {/* Validity */}
                    <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}
                      </span>
                      <span>Valid till {new Date(o.validTo).toLocaleDateString('en-IN')}</span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => nav({ name: 'booking' })}
                      className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-stone-900 text-amber-50 rounded-xl py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors"
                    >
                      Use this code <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* How it works */}
        <div className="mt-10 p-6 rounded-2xl bg-stone-900 text-amber-50">
          <h2 className="text-sm font-semibold mb-3">How promo codes work</h2>
          <ol className="space-y-2 text-xs text-amber-100/85">
            <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-amber-300 mt-0.5 shrink-0" /> Pick a code above and copy it.</li>
            <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-amber-300 mt-0.5 shrink-0" /> Go to the booking page and choose your package.</li>
            <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-amber-300 mt-0.5 shrink-0" /> Paste the code in the &quot;Promo code&quot; field · the discount applies instantly.</li>
            <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-amber-300 mt-0.5 shrink-0" /> Codes can&apos;t be stacked. One code per booking.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
