import { Hono } from 'hono'
import { transaction } from '../db.ts'
import { isNonEmptyString, isObject, readJson } from '../validate.ts'
import { starPrompt } from './favorites.ts'
import { parseHistory, upsertHistory } from './history.ts'
import { parsePrompt, upsertPrompt } from './prompts.ts'
import { parseSkill, upsertSkill } from './skills.ts'
import { parseTaste, upsertTaste } from './taste.ts'
import { parseWorkflow, upsertWorkflow } from './workflows.ts'

export const syncRouter = new Hono()

/** Parses and upserts each item, skipping invalid ones. Returns how many rows were written. */
function upsertAll<T>(items: unknown, parse: (value: unknown) => T | null, upsert: (record: T) => boolean): number {
  if (!Array.isArray(items)) return 0
  let written = 0
  for (const item of items) {
    const record = parse(item)
    if (record && upsert(record)) written++
  }
  return written
}

// POST bulk upsert. The client sends its merged state on startup (see
// src/lib/syncManager.ts). Each record is written only if it's newer than the
// stored copy, so resending the same state is a no-op.
syncRouter.post('/', async (c) => {
  const body = await readJson(c)
  if (!isObject(body)) return c.json({ error: 'Expected a JSON object' }, 400)

  const synced = transaction(() => ({
    prompts: upsertAll(body.prompts, parsePrompt, upsertPrompt),
    workflows: upsertAll(body.workflows, parseWorkflow, upsertWorkflow),
    skills: upsertAll(body.skills, parseSkill, upsertSkill),
    taste: upsertAll(body.taste, parseTaste, upsertTaste),
    favorites: upsertAll(body.favorites, (id) => (isNonEmptyString(id) ? id : null), starPrompt),
    history: upsertAll(body.history, parseHistory, upsertHistory),
  }))

  return c.json({ success: true, synced })
})
