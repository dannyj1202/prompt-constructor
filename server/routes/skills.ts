import { Hono } from 'hono'
import { db, transaction } from '../db.ts'
import { isNonEmptyString, isObject, optionalString, readJson, stringArray } from '../validate.ts'

export const skillsRouter = new Hono()

interface SkillRow {
  name: string
  origin: string
  title: string
  description: string | null
  tags: string | null
  source: string | null
  body: string
  created_at: string
  updated_at: string
}

export interface SkillRecord {
  name: string
  origin: 'user' | 'builtin'
  title: string
  description: string
  tags: string[]
  source: string
  body: string
  createdAt: string
  updatedAt: string
}

function rowToSkill(row: SkillRow): SkillRecord {
  return {
    name: row.name,
    origin: row.origin as 'user' | 'builtin',
    title: row.title,
    description: row.description ?? '',
    tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
    source: row.source ?? `.cursor/skills/${row.name}/SKILL.md`,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Validates an untrusted skill and fills defaults. Returns null if name, title, or body is missing. */
export function parseSkill(value: unknown): SkillRecord | null {
  if (!isObject(value) || !isNonEmptyString(value.name) || !isNonEmptyString(value.title) || !isNonEmptyString(value.body)) {
    return null
  }
  const now = new Date().toISOString()
  return {
    name: value.name,
    origin: value.origin === 'builtin' ? 'builtin' : 'user',
    title: value.title,
    description: optionalString(value.description) ?? '',
    tags: stringArray(value.tags),
    source: optionalString(value.source) ?? `.cursor/skills/${value.name}/SKILL.md`,
    body: value.body,
    createdAt: optionalString(value.createdAt) ?? now,
    updatedAt: optionalString(value.updatedAt) ?? now,
  }
}

// Last write wins by updatedAt: an older copy never overwrites a newer one.
const upsertStmt = db.prepare(`
  INSERT INTO skills (name, origin, title, description, tags, source, body, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (name) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    tags = excluded.tags,
    source = excluded.source,
    body = excluded.body,
    updated_at = excluded.updated_at
  WHERE excluded.updated_at > skills.updated_at
`)

/** Inserts the skill, or replaces the stored copy if this one is newer. Returns whether anything was written. */
export function upsertSkill(skill: SkillRecord): boolean {
  const { changes } = upsertStmt.run(
    skill.name,
    skill.origin,
    skill.title,
    skill.description,
    JSON.stringify(skill.tags),
    skill.source,
    skill.body,
    skill.createdAt,
    skill.updatedAt,
  )
  return Number(changes) > 0
}

function getSkill(name: string): SkillRecord | undefined {
  const row = db.prepare('SELECT * FROM skills WHERE name = ?').get(name) as unknown as SkillRow | undefined
  return row && rowToSkill(row)
}

// GET all skills
skillsRouter.get('/', (c) => {
  const stmt = db.prepare('SELECT * FROM skills ORDER BY created_at DESC')
  const rows = stmt.all() as unknown as SkillRow[]
  return c.json(rows.map(rowToSkill))
})

// GET single skill
skillsRouter.get('/:name', (c) => {
  const skill = getSkill(c.req.param('name'))
  if (!skill) return c.json({ error: 'Skill not found' }, 404)
  return c.json(skill)
})

// POST create skill. The client supplies the name and timestamps.
skillsRouter.post('/', async (c) => {
  const skill = parseSkill(await readJson(c))
  if (!skill) return c.json({ error: 'name, title, and body are required' }, 400)
  upsertSkill(skill)
  return c.json(getSkill(skill.name) ?? skill, 201)
})

// PUT full replacement; creates the skill if it doesn't exist yet. The name
// is the key and is editable, so a body name that differs from the URL's is a
// rename: the old row is removed.
skillsRouter.put('/:name', async (c) => {
  const skill = parseSkill(await readJson(c))
  if (!skill) return c.json({ error: 'name, title, and body are required' }, 400)
  const previousName = c.req.param('name')
  transaction(() => {
    if (skill.name !== previousName) db.prepare('DELETE FROM skills WHERE name = ?').run(previousName)
    upsertSkill(skill)
  })
  return c.json(getSkill(skill.name) ?? skill)
})

// DELETE skill
skillsRouter.delete('/:name', (c) => {
  const name = c.req.param('name')
  const stmt = db.prepare('DELETE FROM skills WHERE name = ?')
  stmt.run(name)
  return c.json({ success: true, name })
})
