import { Hono } from 'hono'
import { db, transaction } from '../db.ts'
import { isNonEmptyString, isObject, isPastTimestamp } from '../validate.ts'

// Tombstones: one row per deleted user item, so a delete survives the startup
// merge (src/lib/syncManager.ts) instead of being restored from a stale copy.
// An item edited after its tombstone's deletedAt counts as re-created and is kept.

export const deletionsRouter = new Hono()

/** Table and key column per entity type. Fixed strings, so safe to interpolate into SQL. */
const ENTITY_TABLES: Record<string, { table: string; key: string }> = {
  prompt: { table: 'prompts', key: 'id' },
  workflow: { table: 'workflows', key: 'id' },
  skill: { table: 'skills', key: 'name' },
  taste: { table: 'taste', key: 'id' },
}

interface DeletionRow {
  entity_type: string
  entity_id: string
  deleted_at: string
}

export interface DeletionRecord {
  entityType: string
  entityId: string
  deletedAt: string
}

/** Validates an untrusted tombstone. Returns null for an unknown type or a malformed or future timestamp. */
export function parseDeletion(value: unknown): DeletionRecord | null {
  if (
    !isObject(value) ||
    typeof value.entityType !== 'string' ||
    !Object.hasOwn(ENTITY_TABLES, value.entityType) ||
    !isNonEmptyString(value.entityId) ||
    !isPastTimestamp(value.deletedAt)
  ) {
    return null
  }
  return { entityType: value.entityType, entityId: value.entityId, deletedAt: value.deletedAt }
}

// Keeps the latest delete time if an item is deleted more than once.
const upsertStmt = db.prepare(`
  INSERT INTO deletions (entity_type, entity_id, deleted_at)
  VALUES (?, ?, ?)
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET deleted_at = excluded.deleted_at
  WHERE excluded.deleted_at > deletions.deleted_at
`)
const getStmt = db.prepare('SELECT deleted_at FROM deletions WHERE entity_type = ? AND entity_id = ?')

/**
 * Stores the tombstone and removes the item, its edit history, and (for
 * prompts) its favorite, skipping anything edited after `deletedAt`. Call
 * inside a transaction. Returns whether the tombstone was new or newer.
 */
export function applyDeletion(deletion: DeletionRecord): boolean {
  const { entityType, entityId, deletedAt } = deletion
  const { table, key } = ENTITY_TABLES[entityType]
  const { changes } = upsertStmt.run(entityType, entityId, deletedAt)
  db.prepare(`DELETE FROM ${table} WHERE ${key} = ? AND updated_at <= ?`).run(entityId, deletedAt)
  db.prepare('DELETE FROM entity_history WHERE id = ? AND updated_at <= ?').run(`${entityType}:${entityId}`, deletedAt)
  if (entityType === 'prompt' && wasPromptDeleted(entityId)) {
    db.prepare('DELETE FROM favorites WHERE prompt_id = ?').run(entityId)
  }
  return Number(changes) > 0
}

/** Handles a DELETE request. `deletedAt` is the client's delete time; falls back to now if missing, malformed, or in the future. */
export function deleteEntity(entityType: string, entityId: string, deletedAt: string | undefined): void {
  transaction(() => {
    applyDeletion({ entityType, entityId, deletedAt: isPastTimestamp(deletedAt) ? deletedAt : new Date().toISOString() })
  })
}

/** True if the item was deleted at or after `updatedAt`, so this copy must not be written back. */
export function isDeleted(entityType: string, entityId: string, updatedAt: string): boolean {
  const row = getStmt.get(entityType, entityId) as unknown as { deleted_at: string } | undefined
  return row !== undefined && updatedAt <= row.deleted_at
}

/** True if a user prompt was deleted and hasn't been re-created since. */
export function wasPromptDeleted(promptId: string): boolean {
  return (
    getStmt.get('prompt', promptId) !== undefined &&
    db.prepare('SELECT 1 FROM prompts WHERE id = ?').get(promptId) === undefined
  )
}

// GET all tombstones, for the client's startup merge
deletionsRouter.get('/', (c) => {
  const rows = db.prepare('SELECT * FROM deletions').all() as unknown as DeletionRow[]
  return c.json(rows.map((row) => ({ entityType: row.entity_type, entityId: row.entity_id, deletedAt: row.deleted_at })))
})
