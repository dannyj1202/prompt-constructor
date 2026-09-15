import { Hono } from 'hono'
import { db } from '../db.ts'
import { isNonEmptyString, isObject, optionalString, readJson, stringArray } from '../validate.ts'
import { deleteEntity, isDeleted } from './deletions.ts'

export const tasteRouter = new Hono()

interface TasteRow {
  id: string
  origin: string
  title: string
  description: string | null
  tags: string | null
  source: string | null
  body: string
  created_at: string
  updated_at: string
}

export interface TasteRecord {
  id: string
  origin: 'user' | 'builtin'
  title: string
  description: string
  tags: string[]
  source: string
  body: string
  createdAt: string
  updatedAt: string
}

function rowToTaste(row: TasteRow): TasteRecord {
  return {
    id: row.id,
    origin: row.origin as 'user' | 'builtin',
    title: row.title,
    description: row.description ?? '',
    tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
    source: row.source ?? 'AGENTS.md',
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Validates an untrusted taste entry and fills defaults. Returns null if id, title, or body is missing. */
export function parseTaste(value: unknown): TasteRecord | null {
  if (!isObject(value) || !isNonEmptyString(value.id) || !isNonEmptyString(value.title) || !isNonEmptyString(value.body)) {
    return null
  }
  const now = new Date().toISOString()
  return {
    id: value.id,
    origin: value.origin === 'builtin' ? 'builtin' : 'user',
    title: value.title,
    description: optionalString(value.description) ?? '',
    tags: stringArray(value.tags),
    source: optionalString(value.source) ?? 'Custom taste convention',
    body: value.body,
    createdAt: optionalString(value.createdAt) ?? now,
    updatedAt: optionalString(value.updatedAt) ?? now,
  }
}

// Last write wins by updatedAt: an older copy never overwrites a newer one.
const upsertStmt = db.prepare(`
  INSERT INTO taste (id, origin, title, description, tags, source, body, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (id) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    tags = excluded.tags,
    source = excluded.source,
    body = excluded.body,
    updated_at = excluded.updated_at
  WHERE excluded.updated_at > taste.updated_at
`)

/** Inserts the entry, or replaces the stored copy if this one is newer. Returns whether anything was written. */
export function upsertTaste(entry: TasteRecord): boolean {
  // Don't restore an entry deleted after this copy was last edited.
  if (isDeleted('taste', entry.id, entry.updatedAt)) return false
  const { changes } = upsertStmt.run(
    entry.id,
    entry.origin,
    entry.title,
    entry.description,
    JSON.stringify(entry.tags),
    entry.source,
    entry.body,
    entry.createdAt,
    entry.updatedAt,
  )
  return Number(changes) > 0
}

function getTaste(id: string): TasteRecord | undefined {
  const row = db.prepare('SELECT * FROM taste WHERE id = ?').get(id) as unknown as TasteRow | undefined
  return row && rowToTaste(row)
}

// GET all taste entries
tasteRouter.get('/', (c) => {
  const stmt = db.prepare('SELECT * FROM taste ORDER BY created_at DESC')
  const rows = stmt.all() as unknown as TasteRow[]
  return c.json(rows.map(rowToTaste))
})

// GET single taste
tasteRouter.get('/:id', (c) => {
  const entry = getTaste(c.req.param('id'))
  if (!entry) return c.json({ error: 'Taste entry not found' }, 404)
  return c.json(entry)
})

// POST create taste. The client generates the id and timestamps.
tasteRouter.post('/', async (c) => {
  const entry = parseTaste(await readJson(c))
  if (!entry) return c.json({ error: 'id, title, and body are required' }, 400)
  upsertTaste(entry)
  return c.json(getTaste(entry.id) ?? entry, 201)
})

// PUT full replacement; creates the entry if it doesn't exist yet.
tasteRouter.put('/:id', async (c) => {
  const entry = parseTaste(await readJson(c))
  if (!entry) return c.json({ error: 'id, title, and body are required' }, 400)
  if (entry.id !== c.req.param('id')) return c.json({ error: 'Body id does not match URL' }, 400)
  upsertTaste(entry)
  return c.json(getTaste(entry.id) ?? entry)
})

// DELETE taste, with its history. `?deletedAt=` is the client's delete time.
tasteRouter.delete('/:id', (c) => {
  const id = c.req.param('id')
  deleteEntity('taste', id, c.req.query('deletedAt'))
  return c.json({ success: true, id })
})
