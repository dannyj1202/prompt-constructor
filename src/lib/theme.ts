// Theme preference: 'system' follows the OS; 'light' and 'dark' override it.
// Dark styles key off a `dark` class on <html> (see the @custom-variant in
// index.css). The inline script in index.html applies the same rules before
// first paint, so keep the storage key and logic there in sync.

export type ThemePreference = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'prompt-constructor:theme:v1'

const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

function read(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

let preference = read()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function apply() {
  const dark = preference === 'dark' || (preference === 'system' && systemDark.matches)
  document.documentElement.classList.toggle('dark', dark)
}

function onStorage(event: StorageEvent) {
  // Another tab changed the preference.
  if (event.key !== THEME_STORAGE_KEY) return
  preference = read()
  apply()
  emit()
}

// While on 'system', follow the OS as it changes (e.g. macOS auto appearance).
systemDark.addEventListener('change', () => {
  if (preference === 'system') apply()
})

apply()

export function getThemePreference(): ThemePreference {
  return preference
}

export function setThemePreference(next: ThemePreference): void {
  preference = next
  try {
    // 'system' is the default, so it's stored as the key's absence.
    if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // Storage unavailable: the choice still applies for this page view.
  }
  apply()
  emit()
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
