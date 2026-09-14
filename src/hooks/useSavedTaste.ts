import { useCallback, useSyncExternalStore } from 'react'
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
    return entry
  }, [])

  const update = useCallback((id: string, input: UserTasteInput): TasteEntry | undefined => {
    let updated: TasteEntry | undefined
    setSavedTaste(
      getSavedTaste().map((entry) => {
        if (entry.id !== id) return entry
        updated = { ...entry, ...input, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const remove = useCallback((id: string) => {
    setSavedTaste(getSavedTaste().filter((entry) => entry.id !== id))
  }, [])

  return { tasteEntries, create, update, remove }
}
