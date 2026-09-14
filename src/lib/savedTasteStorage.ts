import type { TasteEntry } from '../types/taste'

export const SAVED_TASTE_STORAGE_KEY = 'prompt-constructor:saved-taste:v1'

function isUserTaste(value: unknown): value is TasteEntry {
  if (!value || typeof value !== 'object') return false
  const t = value as Partial<TasteEntry>
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.description === 'string' &&
    Array.isArray(t.tags) &&
    typeof t.body === 'string'
  )
}

function read(): TasteEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SAVED_TASTE_STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isUserTaste) : []
  } catch {
    return []
  }
}

let cache: TasteEntry[] | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key !== SAVED_TASTE_STORAGE_KEY) return
  cache = read()
  emit()
}

export function getSavedTaste(): TasteEntry[] {
  cache ??= read()
  return cache
}

export function setSavedTaste(next: TasteEntry[]): void {
  localStorage.setItem(SAVED_TASTE_STORAGE_KEY, JSON.stringify(next))
  cache = next
  emit()
}

export function subscribeSavedTaste(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
