/** Random id; falls back when crypto.randomUUID is unavailable (plain-http origins). */
export function createId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
