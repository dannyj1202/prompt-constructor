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

/** Clock skew allowed between the browser that stamps records and this server (same machine, so small). */
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000

/** A valid timestamp that isn't in the future, so it can't win every later last-write-wins comparison. */
export function isPastTimestamp(value: unknown): value is string {
  return isTimestamp(value) && Date.parse(value) <= Date.now() + MAX_FUTURE_SKEW_MS
}

/**
 * A record's createdAt/updatedAt: `fallback` when absent, the value when it's a valid,
 * non-future timestamp, and null (reject the record) otherwise.
 */
export function recordTimestamp(value: unknown, fallback: string): string | null {
  if (value === undefined || value === null || value === '') return fallback
  return isPastTimestamp(value) ? value : null
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
