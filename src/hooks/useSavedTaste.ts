import { useCallback, useSyncExternalStore } from 'react'
import { apiCreateTaste, apiDeleteTaste, apiUpdateTaste } from '../lib/api'
import { createId } from '../lib/id'
import { getSavedTaste, setSavedTaste, subscribeSavedTaste } from '../lib/savedTasteStorage'
import type { TasteEntry, UserTasteInput } from '../types/taste'

export function useSavedTaste() {
  const tasteEntries = useSyncExternalStore(subscribeSavedTaste, getSavedTaste)

  const create = useCallback((input: UserTasteInput): TasteEntry => {
    const now = new Date().toISOString()
    const entry: TasteEntry = {
      ...input,
      id: `user-taste/${createId()}`,
      origin: 'user',
      createdAt: now,
      updatedAt: now,
    }
    setSavedTaste([entry, ...getSavedTaste()])
    apiCreateTaste(entry).catch((err) => console.warn('[API] Create taste failed, saved locally:', err))
    return entry
  }, [])

  const update = useCallback((id: string, input: UserTasteInput): TasteEntry | undefined => {
    const current = getSavedTaste().find((entry) => entry.id === id)
    if (!current) return undefined
    const updated: TasteEntry = { ...current, ...input, updatedAt: new Date().toISOString() }
    setSavedTaste(getSavedTaste().map((entry) => (entry.id === id ? updated : entry)))
    apiUpdateTaste(id, updated).catch((err) => console.warn('[API] Update taste failed, saved locally:', err))
    return updated
  }, [])

  const remove = useCallback((id: string) => {
    setSavedTaste(getSavedTaste().filter((entry) => entry.id !== id))
    apiDeleteTaste(id).catch((err) => console.warn('[API] Delete taste failed, removed locally:', err))
  }, [])

  return { tasteEntries, create, update, remove }
}
