import type { UserPrompt } from '../types/prompt'

// Shared with mcp/server.ts; keep free of runtime imports so Node can load it directly.

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

/** Validates untrusted saved-prompt data (localStorage or the MCP sync file). */
export function isUserPrompt(value: unknown): value is UserPrompt {
  if (typeof value !== 'object' || value === null) return false
  const p = value as Record<string, unknown>
  return (
    p.origin === 'user' &&
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.description === 'string' &&
    typeof p.body === 'string' &&
    typeof p.createdAt === 'string' &&
    typeof p.updatedAt === 'string' &&
    isStringArray(p.tags)
  )
}
