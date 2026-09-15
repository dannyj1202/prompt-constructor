import { Hono } from 'hono'
import { db } from '../db.ts'

export const favoritesRouter = new Hono()

interface FavoriteRow {
  prompt_id: string
  created_at: string
}

const starStmt = db.prepare(`
  INSERT OR IGNORE INTO favorites (prompt_id, created_at)
  VALUES (?, ?)
`)

/** Stars a prompt. Returns false if it was already starred. */
export function starPrompt(promptId: string): boolean {
  const { changes } = starStmt.run(promptId, new Date().toISOString())
  return Number(changes) > 0
}

// GET all starred prompt IDs
favoritesRouter.get('/', (c) => {
  const stmt = db.prepare('SELECT prompt_id FROM favorites ORDER BY created_at DESC')
  const rows = stmt.all() as unknown as FavoriteRow[]
  return c.json(rows.map((r) => r.prompt_id))
})

// POST star a prompt
favoritesRouter.post('/:promptId', (c) => {
  const promptId = c.req.param('promptId')
  starPrompt(promptId)
  return c.json({ success: true, promptId })
})

// DELETE unstar a prompt
favoritesRouter.delete('/:promptId', (c) => {
  const promptId = c.req.param('promptId')
  const stmt = db.prepare('DELETE FROM favorites WHERE prompt_id = ?')
  stmt.run(promptId)
  return c.json({ success: true, promptId })
})
