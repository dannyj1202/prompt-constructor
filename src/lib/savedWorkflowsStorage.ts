import type { Workflow } from '../types/workflow'

export const SAVED_WORKFLOWS_STORAGE_KEY = 'prompt-constructor:saved-workflows:v1'

function isUserWorkflow(value: unknown): value is Workflow {
  if (!value || typeof value !== 'object') return false
  const w = value as Partial<Workflow>
  return (
    typeof w.id === 'string' &&
    typeof w.title === 'string' &&
    typeof w.description === 'string' &&
    Array.isArray(w.steps)
  )
}

function read(): Workflow[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SAVED_WORKFLOWS_STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isUserWorkflow) : []
  } catch {
    return []
  }
}

let cache: Workflow[] | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key !== SAVED_WORKFLOWS_STORAGE_KEY) return
  cache = read()
  emit()
}

export function getSavedWorkflows(): Workflow[] {
  cache ??= read()
  return cache
}

export function setSavedWorkflows(next: Workflow[]): void {
  localStorage.setItem(SAVED_WORKFLOWS_STORAGE_KEY, JSON.stringify(next))
  cache = next
  emit()
}

export function subscribeSavedWorkflows(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
