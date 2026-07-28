'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Loader2, Check, Image as ImageIcon, Type } from 'lucide-react'

const HERO_FIELDS = [
  { id: 'hero_title', label: 'Title', default: 'Discover Kashmir' },
  { id: 'hero_subtitle1', label: 'Paradise on Earth', default: 'Paradise on Earth' },
  { id: 'hero_subtitle2', label: 'The Crown of India', default: 'The Crown of India' },
  { id: 'hero_tagline', label: 'Tagline', default: 'With The People Who Call It Home' },
  { id: 'hero_description', label: 'Description', default: 'Bespoke journeys through the Valley. Houseboats on Nigeen Lake, powder runs in Gulmarg, glacier treks out of Sonmarg, and the hidden meadows of Yusmarg. Curated by Eliya since 2009.' },
  { id: 'hero_image1', label: 'Hero Image 1 (Srinagar)', default: '', type: 'image' },
  { id: 'hero_image2', label: 'Hero Image 2 (Gulmarg)', default: '', type: 'image' },
  { id: 'hero_image3', label: 'Hero Image 3 (Pahalgam)', default: '', type: 'image' },
  { id: 'hero_image4', label: 'Hero Image 4 (Sonmarg)', default: '', type: 'image' },
]

export function HeroEditor() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/site-settings')
      .then(r => r.json())
      .then(d => setSettings(d.settings || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async (id: string, value: string) => {
    setSaving(id)
    await fetch('/api/site-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, value }),
    })
    setSettings({ ...settings, [id]: value })
    setTimeout(() => setSaving(null), 1000)
  }

  const uploadImage = async (id: string, file: File) => {
    setUploading(id)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await r.json()
    if (data.url) {
      await save(id, data.url)
    }
    setUploading(null)
  }

  if (loading) return <div className="text-stone-500">Loading...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Type className="w-5 h-5 text-stone-900" />
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Hero Section Editor</h2>
      </div>
      <p className="text-sm text-stone-500 mb-4">Edit the text and images on the homepage hero section. Changes go live instantly.</p>

      <div className="space-y-4">
        {HERO_FIELDS.map(field => (
          <div key={field.id} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
            <label className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium block mb-2">{field.label}</label>

            {field.type === 'image' ? (
              <div className="flex items-start gap-3">
                {settings[field.id] && (
                  <div className="w-20 h-20 rounded-xl bg-cover bg-center ring-1 ring-stone-200 shrink-0" style={{ backgroundImage: `url(${settings[field.id]})` }} />
                )}
                <div className="flex-1">
                  <input
                    ref={(el) => { if (el) el.dataset.fieldId = field.id }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(field.id, f) }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.querySelector(`input[data-field-id="${field.id}"]`)?.click()}
                    disabled={uploading === field.id}
                    className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-900 text-amber-50 rounded-full px-3 py-1.5 hover:bg-stone-700 disabled:opacity-50"
                  >
                    {uploading === field.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {uploading === field.id ? 'Uploading...' : 'Upload image'}
                  </button>
                  <input
                    type="text"
                    value={settings[field.id] || ''}
                    onChange={(e) => setSettings({ ...settings, [field.id]: e.target.value })}
                    onBlur={(e) => save(field.id, e.target.value)}
                    className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-lg px-3 py-2 text-xs mt-2 focus:outline-none focus:ring-2 focus:ring-stone-400"
                    placeholder="...or paste image URL"
                  />
                </div>
                {saving === field.id && <Check className="w-4 h-4 text-green-600 shrink-0" />}
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <textarea
                  rows={field.id === 'hero_description' ? 3 : 1}
                  value={settings[field.id] ?? field.default}
                  onChange={(e) => setSettings({ ...settings, [field.id]: e.target.value })}
                  onBlur={(e) => save(field.id, e.target.value)}
                  className="flex-1 bg-stone-50 ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
                />
                {saving === field.id && <Check className="w-4 h-4 text-green-600 shrink-0 mt-2" />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
