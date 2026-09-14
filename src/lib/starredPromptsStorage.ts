export const STARRED_PROMPTS_STORAGE_KEY = 'prompt-constructor:starred-prompts:v1'

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STARRED_PROMPTS_STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

let cache: string[] | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key !== STARRED_PROMPTS_STORAGE_KEY) return
  cache = read()
  emit()
}

export function getStarredPromptIds(): string[] {
  cache ??= read()
  return cache
}

export function setStarredPromptIds(next: string[]): void {
  localStorage.setItem(STARRED_PROMPTS_STORAGE_KEY, JSON.stringify(next))
  cache = next
  emit()
}

export function subscribeStarredPrompts(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
