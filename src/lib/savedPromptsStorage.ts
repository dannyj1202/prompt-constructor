import type { UserPrompt } from '../types/prompt'
import { syncSavedPromptsToMcp } from './mcpSync'
import { isUserPrompt } from './userPromptGuard'

// Saved prompts live under their own localStorage key; built-in prompts ship
// with the app and are never written to storage.
export const SAVED_PROMPTS_STORAGE_KEY = 'prompt-constructor:saved-prompts:v1'

function read(): UserPrompt[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SAVED_PROMPTS_STORAGE_KEY) ?? '[]')
    // Drop malformed entries rather than crash on hand-edited storage.
    return Array.isArray(parsed) ? parsed.filter(isUserPrompt) : []
  } catch {
    return []
  }
}

// A module-level cache gives useSyncExternalStore a stable snapshot.
let cache: UserPrompt[] | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key !== SAVED_PROMPTS_STORAGE_KEY) return
  cache = read()
  emit()
}

export function getSavedPrompts(): UserPrompt[] {
  cache ??= read()
  return cache
}

/** Throws if localStorage is full or unavailable. */
export function setSavedPrompts(next: UserPrompt[]): void {
  localStorage.setItem(SAVED_PROMPTS_STORAGE_KEY, JSON.stringify(next))
  cache = next
  emit()
  syncSavedPromptsToMcp(next)
}

export function subscribeSavedPrompts(listener: () => void): () => void {
  listeners.add(listener)
  // Other tabs write to the same key; pick up their changes.
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
