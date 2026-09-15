import type { Context } from 'hono'

// Request bodies are untrusted: these narrow `unknown` and fill defaults so
// nothing undefined ever reaches a SQLite bind parameter.

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

/** A non-empty string, or undefined (so an empty field clears the stored value). */
export function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined
}

/** An ISO 8601 UTC timestamp exactly as Date#toISOString() writes it, so string comparison orders correctly. */
export function isTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const time = Date.parse(value)
  return !Number.isNaN(time) && new Date(time).toISOString() === value
}

export function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

/** Parses the JSON body, returning null instead of throwing on malformed input. */
export async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json()
  } catch {
    return null
  }
}
