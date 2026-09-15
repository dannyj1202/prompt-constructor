import { Hono } from 'hono'
import { db } from '../db.ts'
import { isNonEmptyString, isObject, optionalString, readJson, stringArray } from '../validate.ts'
import { deleteEntity, isDeleted } from './deletions.ts'

export const promptsRouter = new Hono()

interface PromptRow {
  id: string
  origin: string
  title: string
  description: string | null
  category: string | null
  tags: string | null
  source: string | null
  body: string
  created_at: string
  updated_at: string
}

export interface PromptRecord {
  id: string
  origin: 'user' | 'builtin'
  title: string
  description: string
  category?: string
  tags: string[]
  source?: string
  body: string
  createdAt: string
  updatedAt: string
}

function rowToPrompt(row: PromptRow): PromptRecord {
  return {
    id: row.id,
    origin: row.origin as 'user' | 'builtin',
    title: row.title,
    description: row.description ?? '',
    category: row.category ?? undefined,
    tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
    source: row.source ?? undefined,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Validates an untrusted prompt and fills defaults. Returns null if id, title, or body is missing. */
export function parsePrompt(value: unknown): PromptRecord | null {
  if (!isObject(value) || !isNonEmptyString(value.id) || !isNonEmptyString(value.title) || !isNonEmptyString(value.body)) {
    return null
  }
  const now = new Date().toISOString()
  return {
    id: value.id,
    origin: value.origin === 'builtin' ? 'builtin' : 'user',
    title: value.title,
    description: optionalString(value.description) ?? '',
    category: optionalString(value.category),
    tags: stringArray(value.tags),
    source: optionalString(value.source),
    body: value.body,
    createdAt: optionalString(value.createdAt) ?? now,
    updatedAt: optionalString(value.updatedAt) ?? now,
  }
}

// Last write wins by updatedAt: an older copy never overwrites a newer one.
const upsertStmt = db.prepare(`
  INSERT INTO prompts (id, origin, title, description, category, tags, source, body, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (id) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    tags = excluded.tags,
    source = excluded.source,
    body = excluded.body,
    updated_at = excluded.updated_at
  WHERE excluded.updated_at > prompts.updated_at
`)

/** Inserts the prompt, or replaces the stored copy if this one is newer. Returns whether anything was written. */
export function upsertPrompt(prompt: PromptRecord): boolean {
  // Don't restore a prompt deleted after this copy was last edited.
  if (isDeleted('prompt', prompt.id, prompt.updatedAt)) return false
  const { changes } = upsertStmt.run(
    prompt.id,
    prompt.origin,
    prompt.title,
    prompt.description,
    prompt.category ?? null,
    JSON.stringify(prompt.tags),
    prompt.source ?? null,
    prompt.body,
    prompt.createdAt,
    prompt.updatedAt,
  )
  return Number(changes) > 0
}

function getPrompt(id: string): PromptRecord | undefined {
  const row = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id) as unknown as PromptRow | undefined
  return row && rowToPrompt(row)
}

// GET all prompts
promptsRouter.get('/', (c) => {
  const stmt = db.prepare('SELECT * FROM prompts ORDER BY created_at DESC')
  const rows = stmt.all() as unknown as PromptRow[]
  return c.json(rows.map(rowToPrompt))
})

// GET single prompt
promptsRouter.get('/:id', (c) => {
  const prompt = getPrompt(c.req.param('id'))
  if (!prompt) return c.json({ error: 'Prompt not found' }, 404)
  return c.json(prompt)
})

// POST create prompt. The client generates the id and timestamps.
promptsRouter.post('/', async (c) => {
  const prompt = parsePrompt(await readJson(c))
  if (!prompt) return c.json({ error: 'id, title, and body are required' }, 400)
  upsertPrompt(prompt)
  return c.json(getPrompt(prompt.id) ?? prompt, 201)
})

// PUT full replacement; creates the prompt if it doesn't exist yet. Responds
// with the stored copy, which stays the existing one if the request was older.
promptsRouter.put('/:id', async (c) => {
  const prompt = parsePrompt(await readJson(c))
  if (!prompt) return c.json({ error: 'id, title, and body are required' }, 400)
  if (prompt.id !== c.req.param('id')) return c.json({ error: 'Body id does not match URL' }, 400)
  upsertPrompt(prompt)
  return c.json(getPrompt(prompt.id) ?? prompt)
})

// DELETE prompt, with its history and favorite. `?deletedAt=` is the client's
// delete time, so the tombstone is comparable with its updatedAt values.
promptsRouter.delete('/:id', (c) => {
  const id = c.req.param('id')
  deleteEntity('prompt', id, c.req.query('deletedAt'))
  return c.json({ success: true, id })
})
