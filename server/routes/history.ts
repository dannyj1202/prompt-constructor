import { Hono } from 'hono'
import { db } from '../db.ts'
import { isNonEmptyString, isObject, optionalString, readJson } from '../validate.ts'
import { isDeleted } from './deletions.ts'

export const historyRouter = new Hono()

const ENTITY_TYPES: readonly string[] = ['prompt', 'workflow', 'skill', 'taste']

interface HistoryRow {
  id: string
  entity_type: string
  entity_id: string
  title: string
  original_snapshot: string
  current_snapshot: string
  current_version_number: number
  revisions: string
  created_at: string
  updated_at: string
}

/** Mirrors EntityHistoryRecord in src/types/history.ts. Snapshots and revisions are stored as-is. */
export interface HistoryRecord {
  entityId: string
  entityType: string
  title: string
  originalSnapshot: unknown
  currentSnapshot: unknown
  currentVersionNumber: number
  revisions: unknown[]
  createdAt: string
  updatedAt: string
}

function historyKey(record: HistoryRecord): string {
  return `${record.entityType}:${record.entityId}`
}

function rowToHistoryRecord(row: HistoryRow): HistoryRecord {
  return {
    entityId: row.entity_id,
    entityType: row.entity_type,
    title: row.title,
    originalSnapshot: JSON.parse(row.original_snapshot),
    currentSnapshot: JSON.parse(row.current_snapshot),
    currentVersionNumber: row.current_version_number,
    revisions: JSON.parse(row.revisions) as unknown[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Validates an untrusted history record. The client builds revisions (see
 * src/lib/entityHistoryStorage.ts); the server only stores the result.
 */
export function parseHistory(value: unknown): HistoryRecord | null {
  if (
    !isObject(value) ||
    !isNonEmptyString(value.entityId) ||
    typeof value.entityType !== 'string' ||
    !ENTITY_TYPES.includes(value.entityType) ||
    typeof value.currentVersionNumber !== 'number' ||
    !Array.isArray(value.revisions) ||
    value.revisions.length === 0
  ) {
    return null
  }
  const now = new Date().toISOString()
  return {
    entityId: value.entityId,
    entityType: value.entityType,
    title: optionalString(value.title) ?? 'Untitled',
    originalSnapshot: value.originalSnapshot ?? null,
    currentSnapshot: value.currentSnapshot ?? null,
    currentVersionNumber: value.currentVersionNumber,
    revisions: value.revisions,
    createdAt: optionalString(value.createdAt) ?? now,
    updatedAt: optionalString(value.updatedAt) ?? now,
  }
}

// Last write wins by updatedAt: an older copy never overwrites a newer one.
const upsertStmt = db.prepare(`
  INSERT INTO entity_history (
    id, entity_type, entity_id, title, original_snapshot, current_snapshot, current_version_number, revisions, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (id) DO UPDATE SET
    title = excluded.title,
    current_snapshot = excluded.current_snapshot,
    current_version_number = excluded.current_version_number,
    revisions = excluded.revisions,
    updated_at = excluded.updated_at
  WHERE excluded.updated_at > entity_history.updated_at
`)

/** Inserts the record, or replaces the stored copy if this one is newer. Returns whether anything was written. */
export function upsertHistory(record: HistoryRecord): boolean {
  // A deleted item's history goes with it, unless it was edited afterwards.
  if (isDeleted(record.entityType, record.entityId, record.updatedAt)) return false
  const { changes } = upsertStmt.run(
    historyKey(record),
    record.entityType,
    record.entityId,
    record.title,
    JSON.stringify(record.originalSnapshot),
    JSON.stringify(record.currentSnapshot),
    record.currentVersionNumber,
    JSON.stringify(record.revisions),
    record.createdAt,
    record.updatedAt,
  )
  return Number(changes) > 0
}

function getHistory(key: string): HistoryRecord | undefined {
  const row = db.prepare('SELECT * FROM entity_history WHERE id = ?').get(key) as unknown as HistoryRow | undefined
  return row && rowToHistoryRecord(row)
}

// GET all history records
historyRouter.get('/', (c) => {
  const stmt = db.prepare('SELECT * FROM entity_history ORDER BY updated_at DESC')
  const rows = stmt.all() as unknown as HistoryRow[]
  return c.json(rows.map(rowToHistoryRecord))
})

// GET history for a single entity
historyRouter.get('/:type/:id', (c) => {
  const record = getHistory(`${c.req.param('type')}:${c.req.param('id')}`)
  if (!record) return c.json({ error: 'History not found' }, 404)
  return c.json(record)
})

// PUT the full record the client computed after an edit or revert.
historyRouter.put('/:type/:id', async (c) => {
  const record = parseHistory(await readJson(c))
  if (!record) return c.json({ error: 'entityType, entityId, currentVersionNumber, and revisions are required' }, 400)
  if (record.entityType !== c.req.param('type') || record.entityId !== c.req.param('id')) {
    return c.json({ error: 'Body entityType/entityId do not match URL' }, 400)
  }
  upsertHistory(record)
  return c.json(getHistory(historyKey(record)) ?? record)
})

// DELETE history
historyRouter.delete('/:type/:id', (c) => {
  const key = `${c.req.param('type')}:${c.req.param('id')}`
  const stmt = db.prepare('DELETE FROM entity_history WHERE id = ?')
  stmt.run(key)
  return c.json({ success: true, key })
})
