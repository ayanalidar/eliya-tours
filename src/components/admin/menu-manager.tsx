'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Edit, Trash2, Check, X, Upload, Loader2, Utensils } from 'lucide-react'

type MenuItem = {
  id: string
  name: string
  description: string
  category: string
  mealType: string
  price: number
  image: string | null
  available: boolean
}

const CATEGORIES = ['Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages', 'Wazwan', 'Kashmiri Special']

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')

  const load = () => {
    setLoading(true)
    fetch('/api/menu')
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [])

  const del = async (id: string) => {
    if (!confirm('Delete this menu item?')) return
    await fetch(`/api/menu?id=${id}`, { method: 'DELETE' })
    load()
  }

  const toggleAvailable = async (item: MenuItem) => {
    await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, available: !item.available }),
    })
    load()
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Utensils className="w-5 h-5 text-stone-900" />
          <h2 className="text-xl font-semibold tracking-tight text-stone-950">Menu Items ({items.length})</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1.5 text-sm font-medium bg-stone-900 text-amber-50 rounded-full px-4 py-2 hover:bg-stone-700">
          <Plus className="w-4 h-4" /> New item
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ring-1 ${filter === c ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-white text-stone-700 ring-stone-300'}`}>
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* New item form */}
      {showForm && <MenuItemForm onSave={() => { setShowForm(false); load() }} onCancel={() => setShowForm(false)} />}

      {/* Items list */}
      {loading ? <div className="text-stone-500">Loading...</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden">
              {item.image && (
                <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${item.mealType === 'veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.mealType === 'veg' ? 'VEG' : 'NON-VEG'}
                      </span>
                      <h3 className="font-semibold text-stone-950 text-sm truncate">{item.name}</h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{item.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-semibold tabular-nums text-stone-950">Rs.{item.price}</span>
                      <span className="text-[10px] text-stone-400">{item.category}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setEditingId(editingId === item.id ? null : item.id)} className="text-xs inline-flex items-center gap-1 text-stone-700 hover:text-stone-950">
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => toggleAvailable(item)} className={`text-xs px-2 py-0.5 rounded-full ${item.available ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </button>
                  <button onClick={() => del(item.id)} className="text-xs inline-flex items-center gap-1 text-red-600 hover:text-red-700 ml-auto">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {editingId === item.id && (
                  <MenuItemForm item={item} onSave={() => { setEditingId(null); load() }} onCancel={() => setEditingId(null)} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MenuItemForm({ item, onSave, onCancel }: { item?: MenuItem; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    category: item?.category || 'Main Course',
    mealType: item?.mealType || 'veg',
    price: item?.price || 0,
    image: item?.image || '',
    available: item?.available ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const save = async () => {
    setSaving(true)
    if (item) {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, ...form, price: Number(form.price) }),
      })
    } else {
      await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      })
    }
    setSaving(false)
    onSave()
  }

  const upload = async (file: File) => {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await r.json()
    if (data.url) setForm({ ...form, image: data.url })
    setUploading(false)
  }

  return (
    <div className="mt-3 bg-stone-50 rounded-xl p-3 ring-1 ring-stone-200 space-y-2">
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dish name *" className="w-full bg-white ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm" />
      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-white ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm resize-none" />
      <div className="grid grid-cols-2 gap-2">
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-white ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })} className="bg-white ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm">
          <option value="veg">Vegetarian</option>
          <option value="nonveg">Non-Vegetarian</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} placeholder="Price (Rs.)" className="bg-white ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm" />
        <div className="flex items-center gap-2">
          {form.image && <div className="w-8 h-8 rounded bg-cover bg-center ring-1 ring-stone-200" style={{ backgroundImage: `url(${form.image})` }} />}
          <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs bg-stone-900 text-amber-50 rounded-full px-2.5 py-1">
            {uploading ? '...' : 'Upload'}
          </button>
        </div>
      </div>
      <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="...or paste image URL" className="w-full bg-white ring-1 ring-stone-200 rounded-lg px-3 py-2 text-xs" />
      <div className="flex gap-2">
        <button onClick={save} disabled={saving || !form.name} className="inline-flex items-center gap-1 bg-stone-900 text-amber-50 rounded-full px-4 py-1.5 text-xs font-medium disabled:opacity-50">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
        </button>
        <button onClick={onCancel} className="text-stone-600 hover:text-stone-900 text-xs px-3 py-1.5">
          <X className="w-3 h-3 inline" /> Cancel
        </button>
      </div>
    </div>
  )
}
