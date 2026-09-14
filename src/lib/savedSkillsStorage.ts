import type { Skill } from '../types/skill'

export const SAVED_SKILLS_STORAGE_KEY = 'prompt-constructor:saved-skills:v1'

function isUserSkill(value: unknown): value is Skill {
  if (!value || typeof value !== 'object') return false
  const s = value as Partial<Skill>
  return (
    typeof s.name === 'string' &&
    typeof s.title === 'string' &&
    typeof s.description === 'string' &&
    Array.isArray(s.tags) &&
    typeof s.body === 'string'
  )
}

function read(): Skill[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SAVED_SKILLS_STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isUserSkill) : []
  } catch {
    return []
  }
}

let cache: Skill[] | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key !== SAVED_SKILLS_STORAGE_KEY) return
  cache = read()
  emit()
}

export function getSavedSkills(): Skill[] {
  cache ??= read()
  return cache
}

export function setSavedSkills(next: Skill[]): void {
  localStorage.setItem(SAVED_SKILLS_STORAGE_KEY, JSON.stringify(next))
  cache = next
  emit()
}

export function subscribeSavedSkills(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
