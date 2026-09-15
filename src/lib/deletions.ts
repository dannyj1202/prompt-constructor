import type { EntityType } from '../types/history'
import { apiDeleteEntity } from './api'
import { removeEntityHistoryLocally } from './entityHistoryStorage'
import { getStarredPromptIds, setStarredPromptIds } from './starredPromptsStorage'

// Tombstones for deleted user items, kept so the startup merge doesn't restore
// an item from the API's copy (see syncManager.ts). Never rendered, so unlike
// the other stores this one has no subscribers.

export const DELETIONS_STORAGE_KEY = 'prompt-constructor:deletions:v1'

export interface Deletion {
  entityType: EntityType
  entityId: string
  /** ISO 8601 */
  deletedAt: string
}

function isDeletion(value: unknown): value is Deletion {
  if (typeof value !== 'object' || value === null) return false
  const d = value as Record<string, unknown>
  return typeof d.entityType === 'string' && typeof d.entityId === 'string' && typeof d.deletedAt === 'string'
}

export function getDeletions(): Deletion[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DELETIONS_STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isDeletion) : []
  } catch {
    return []
  }
}

export function setDeletions(next: Deletion[]): void {
  localStorage.setItem(DELETIONS_STORAGE_KEY, JSON.stringify(next))
}

/**
 * Finishes deleting a user item once its own store has dropped it: removes its
 * edit history and (for prompts) its star, records a tombstone, and tells the
 * API, which does the same cascade on its side.
 */
export function recordDeletion(entityType: EntityType, entityId: string): void {
  const deletedAt = new Date().toISOString()
  setDeletions([
    ...getDeletions().filter((d) => d.entityType !== entityType || d.entityId !== entityId),
    { entityType, entityId, deletedAt },
  ])
  removeEntityHistoryLocally(entityType, entityId)
  if (entityType === 'prompt') {
    const starred = getStarredPromptIds()
    if (starred.includes(entityId)) setStarredPromptIds(starred.filter((id) => id !== entityId))
  }
  apiDeleteEntity(entityType, entityId, deletedAt).catch((err) =>
    console.warn(`[API] Delete ${entityType} failed, removed locally:`, err),
  )
}
