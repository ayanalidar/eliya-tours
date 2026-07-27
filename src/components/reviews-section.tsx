'use client'

import { useEffect, useState } from 'react'
import { Star, Loader2, Check, X, Plus } from 'lucide-react'
import { useApp } from '@/lib/app-context'

// ============================================================
// Reviews widget — shows approved reviews + a submit form
// ============================================================

type Review = {
  id: string
  guestName: string
  rating: number
  title: string
  body: string
  tripDate: string | null
  verified: boolean
  reply: string | null
  createdAt: string
}

export function ReviewsSection({ destinationId, accent = 'oklch(0.62 0.13 165)' }: { destinationId: string; accent?: string }) {
  const { pushToast } = useApp()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guestName: '', guestEmail: '', rating: 5, title: '', body: '', tripDate: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?destinationId=${encodeURIComponent(destinationId)}&approved=true`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [destinationId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const r = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, destinationId }),
      })
      const data = await r.json()
      if (r.ok) {
        pushToast({ type: 'success', title: 'Review submitted', message: 'Thank you! It will appear after admin approval.' })
        setShowForm(false)
        setForm({ guestName: '', guestEmail: '', rating: 5, title: '', body: '', tripDate: '' })
      } else {
        pushToast({ type: 'error', title: 'Failed', message: data.error })
      }
    } catch {
      pushToast({ type: 'error', title: 'Network error' })
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm uppercase tracking-[0.18em] text-stone-500 font-semibold">Guest reviews</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-stone-950">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-stone-500">· {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-950 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-full px-3 py-1.5 transition-colors"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Write a review'}
        </button>
      </div>

      {/* Submit form */}
      {showForm && (
        <form onSubmit={submit} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4 mb-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input required value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="Your name *" className="bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            <input required type="email" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} placeholder="Email * (kept private)" className="bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}>
                  <Star className={`w-6 h-6 ${s <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} transition-colors`} />
                </button>
              ))}
            </div>
          </div>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Review title *" className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          <textarea required rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Tell us about your experience *" className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none" />
          <input type="month" value={form.tripDate} onChange={(e) => setForm({ ...form, tripDate: e.target.value })} className="bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-5 py-2 text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Submit review
          </button>
          <p className="text-[11px] text-stone-400">Reviews appear after admin approval to prevent spam.</p>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="text-sm text-stone-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 text-sm text-stone-500 text-center">
          No reviews yet. Be the first to share your experience!
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-950 text-sm">{r.guestName}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                        <Check className="w-2.5 h-2.5" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                    ))}
                    {r.tripDate && <span className="text-[11px] text-stone-500 ml-2">· Trip: {r.tripDate}</span>}
                  </div>
                </div>
                <span className="text-[10px] text-stone-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <h4 className="mt-2 text-sm font-medium text-stone-950">{r.title}</h4>
              <p className="mt-1 text-sm text-stone-600 leading-relaxed">{r.body}</p>
              {r.reply && (
                <div className="mt-3 p-3 bg-stone-50 rounded-xl ring-1 ring-stone-100">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 font-semibold mb-1">Eliya&apos;s reply</div>
                  <p className="text-xs text-stone-700">{r.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
