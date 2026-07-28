// ============================================================
// Safe JSON parse · handles double-encoded strings, nulls,
// non-arrays, and malformed JSON without throwing
// ============================================================

export function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value !== 'string') {
    // Already parsed (e.g., array or object)
    return value as T
  }
  try {
    const parsed = JSON.parse(value)
    // Handle double-encoding (string within a string)
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed) as T
      } catch {
        return fallback
      }
    }
    return parsed as T
  } catch {
    return fallback
  }
}

export function safeArray(value: unknown): unknown[] {
  const parsed = safeJsonParse(value, [])
  return Array.isArray(parsed) ? parsed : []
}

export function safeStringArray(value: unknown): string[] {
  const arr = safeArray(value)
  return arr.map((x) => String(x))
}
