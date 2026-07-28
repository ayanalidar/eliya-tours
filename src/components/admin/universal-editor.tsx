'use client'

import { useEffect, useState } from 'react'
import { Edit, Trash2, Check, X, Search, Database } from 'lucide-react'

// ============================================================
// Universal data editor · lets admins edit ANY table's records
// ============================================================

type TableDef = {
  id: string
  label: string
  apiPath: string
  editableFields: Array<{ key: string; label: string; type: 'text' | 'number' | 'boolean' | 'textarea' | 'json' }>
}

const TABLES: TableDef[] = [
  {
    id: 'Destination',
    label: 'Destinations',
    apiPath: '/api/destinations',
    editableFields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'region', label: 'Region', type: 'text' },
      { key: 'area', label: 'Area', type: 'text' },
      { key: 'elevation', label: 'Elevation', type: 'text' },
      { key: 'bestSeason', label: 'Best Season', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'longDescription', label: 'Long Description', type: 'textarea' },
      { key: 'image', label: 'Image URL', type: 'text' },
      { key: 'accent', label: 'Accent Color', type: 'text' },
      { key: 'latitude', label: 'Latitude', type: 'number' },
      { key: 'longitude', label: 'Longitude', type: 'number' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'curated', label: 'Curated %', type: 'number' },
      { key: 'visitors', label: 'Visitors %', type: 'number' },
      { key: 'safety', label: 'Safety %', type: 'number' },
      { key: 'highlights', label: 'Highlights (JSON)', type: 'json' },
    ],
  },
  {
    id: 'Season',
    label: 'Seasons',
    apiPath: '/api/seasons',
    editableFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'season', label: 'Season', type: 'text' },
      { key: 'months', label: 'Months', type: 'text' },
      { key: 'theme', label: 'Theme', type: 'text' },
      { key: 'duration', label: 'Duration', type: 'text' },
      { key: 'priceFrom', label: 'Price From', type: 'number' },
      { key: 'image', label: 'Image URL', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'isFeatured', label: 'Featured', type: 'boolean' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'longDescription', label: 'Long Description', type: 'textarea' },
      { key: 'destinations', label: 'Destinations (JSON)', type: 'json' },
      { key: 'itinerary', label: 'Itinerary (JSON)', type: 'json' },
    ],
  },
  {
    id: 'Hotel',
    label: 'Hotels',
    apiPath: '/api/hotels',
    editableFields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'destinationId', label: 'Destination ID', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'starRating', label: 'Star Rating', type: 'number' },
      { key: 'priceFrom', label: 'Price From', type: 'number' },
      { key: 'rooms', label: 'Rooms', type: 'number' },
      { key: 'image', label: 'Image URL', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'longDescription', label: 'Long Description', type: 'textarea' },
      { key: 'amenities', label: 'Amenities (JSON)', type: 'json' },
    ],
  },
  {
    id: 'AdventureSport',
    label: 'Adventures',
    apiPath: '/api/adventures',
    editableFields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'destinationId', label: 'Destination ID', type: 'text' },
      { key: 'season', label: 'Season', type: 'text' },
      { key: 'duration', label: 'Duration', type: 'text' },
      { key: 'difficulty', label: 'Difficulty', type: 'text' },
      { key: 'minAge', label: 'Min Age', type: 'number' },
      { key: 'maxGroup', label: 'Max Group', type: 'number' },
      { key: 'priceFrom', label: 'Price From', type: 'number' },
      { key: 'image', label: 'Image URL', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'longDescription', label: 'Long Description', type: 'textarea' },
      { key: 'gear', label: 'Gear (JSON)', type: 'json' },
      { key: 'safety', label: 'Safety (JSON)', type: 'json' },
    ],
  },
  {
    id: 'Offer',
    label: 'Offers',
    apiPath: '/api/offers',
    editableFields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'discountPct', label: 'Discount %', type: 'number' },
      { key: 'active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    id: 'Review',
    label: 'Reviews',
    apiPath: '/api/reviews',
    editableFields: [
      { key: 'guestName', label: 'Guest Name', type: 'text' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'tripDate', label: 'Trip Date', type: 'text' },
      { key: 'verified', label: 'Verified', type: 'boolean' },
      { key: 'approved', label: 'Approved', type: 'boolean' },
      { key: 'reply', label: 'Reply', type: 'textarea' },
    ],
  },
  {
    id: 'Itinerary',
    label: 'Itineraries',
    apiPath: '/api/itineraries',
    editableFields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'days', label: 'Days (JSON)', type: 'json' },
      { key: 'totalCost', label: 'Total Cost', type: 'number' },
    ],
  },
]

export function UniversalEditor() {
  const [selectedTable, setSelectedTable] = useState<TableDef>(TABLES[0])
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, unknown>>({})
  const [search, setSearch] = useState('')

  const loadRecords = (table: TableDef) => {
    setLoading(true)
    fetch(table.apiPath)
      .then((r) => r.json())
      .then((d) => {
        const key = table.id.charAt(0).toLowerCase() + table.id.slice(1)
        const possibleKeys = [key, key + 's', table.id.toLowerCase()]
        let found: unknown[] = []
        for (const k of possibleKeys) {
          if (Array.isArray(d[k])) {
            found = d[k] as unknown[]
            break
          }
        }
        setRecords(found as Record<string, unknown>[])
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRecords(selectedTable)
    setEditingId(null)
  }, [selectedTable])

  const startEdit = (record: Record<string, unknown>) => {
    setEditingId(record.id as string)
    setEditForm({ ...record })
  }

  const saveEdit = async () => {
    const { id, createdAt, updatedAt, ...updates } = editForm
    await fetch(selectedTable.apiPath, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    setEditingId(null)
    loadRecords(selectedTable)
  }

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this record?')) return
    await fetch(`${selectedTable.apiPath}?id=${id}`, { method: 'DELETE' })
    loadRecords(selectedTable)
  }

  const filtered = records.filter((r) => {
    if (!search) return true
    return JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Database className="w-5 h-5 text-stone-900" />
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">Universal Data Editor</h2>
      </div>
      <p className="text-sm text-stone-500 mb-4">Edit any record in any table. Changes go live instantly.</p>

      {/* Table selector */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
        {TABLES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTable(t)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full ring-1 transition-all ${
              selectedTable.id === t.id
                ? 'bg-stone-900 text-amber-50 ring-stone-900'
                : 'bg-white text-stone-700 ring-stone-300 hover:ring-stone-500'
            }`}
          >
            {t.label} ({selectedTable.id === t.id ? records.length : '...'})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search records..."
          className="w-full bg-white ring-1 ring-stone-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      {/* Records */}
      {loading ? (
        <div className="text-stone-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-stone-500 text-sm">No records found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <div key={record.id as string} className="bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden">
              {editingId === record.id ? (
                <div className="p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-stone-500 font-semibold mb-3">
                    Editing: {String(record.name || record.title || record.code || record.id)}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedTable.editableFields.map((field) => (
                      <div key={field.key} className={field.type === 'textarea' || field.type === 'json' ? 'sm:col-span-2' : ''}>
                        <label className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium block mb-1">
                          {field.label}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={String(editForm[field.key] ?? '')}
                            onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                            className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
                          />
                        ) : field.type === 'json' ? (
                          <textarea
                            rows={4}
                            value={String(editForm[field.key] ?? '[]')}
                            onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.value })}
                            className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
                          />
                        ) : field.type === 'boolean' ? (
                          <label className="flex items-center gap-2 text-sm py-2">
                            <input
                              type="checkbox"
                              checked={Boolean(editForm[field.key])}
                              onChange={(e) => setEditForm({ ...editForm, [field.key]: e.target.checked })}
                              className="w-4 h-4"
                            />
                            {Boolean(editForm[field.key]) ? 'Yes' : 'No'}
                          </label>
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={String(editForm[field.key] ?? '')}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value
                            })}
                            className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={saveEdit}
                      className="inline-flex items-center gap-1.5 bg-stone-900 text-amber-50 rounded-full px-4 py-2 text-sm font-medium hover:bg-stone-700"
                    >
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-stone-300 hover:ring-stone-500"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-stone-950 text-sm">
                          {String(record.name || record.title || record.code || record.id)}
                        </h3>
                        <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-mono">
                          {String(record.id)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                        {String(record.description || record.tagline || record.body || record.email || '')}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-600">
                        {selectedTable.editableFields.slice(0, 5).map((f) => {
                          const val = record[f.key]
                          if (val === undefined || val === null || val === '') return null
                          const display = f.type === 'boolean' ? (val ? '✓' : '✗') : String(val).slice(0, 50)
                          return (
                            <span key={f.key} className="inline-flex items-center gap-1">
                              <span className="text-stone-400">{f.label}:</span>
                              <span className="font-medium">{display}</span>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(record)}
                        className="grid place-items-center w-8 h-8 rounded-full hover:bg-stone-100 text-stone-700"
                        aria-label="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteRecord(record.id as string)}
                        className="grid place-items-center w-8 h-8 rounded-full hover:bg-red-50 text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
