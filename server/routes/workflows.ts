import { Hono } from 'hono'
import { db } from '../db.ts'
import { isNonEmptyString, isObject, optionalString, readJson, stringArray } from '../validate.ts'
import { deleteEntity, isDeleted } from './deletions.ts'

export const workflowsRouter = new Hono()

interface WorkflowRow {
  id: string
  origin: string
  title: string
  description: string | null
  steps: string
  tags: string | null
  created_at: string
  updated_at: string
}

interface WorkflowStep {
  promptId: string
  note?: string
}

export interface WorkflowRecord {
  id: string
  origin: 'user' | 'builtin'
  title: string
  description: string
  steps: WorkflowStep[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

function rowToWorkflow(row: WorkflowRow): WorkflowRecord {
  return {
    id: row.id,
    origin: row.origin as 'user' | 'builtin',
    title: row.title,
    description: row.description ?? '',
    steps: JSON.parse(row.steps || '[]') as WorkflowStep[],
    tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function parseSteps(value: unknown): WorkflowStep[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((step: unknown) =>
    isObject(step) && isNonEmptyString(step.promptId) ? [{ promptId: step.promptId, note: optionalString(step.note) }] : [],
  )
}

/** Validates an untrusted workflow and fills defaults. Returns null if id or title is missing. */
export function parseWorkflow(value: unknown): WorkflowRecord | null {
  if (!isObject(value) || !isNonEmptyString(value.id) || !isNonEmptyString(value.title)) return null
  const now = new Date().toISOString()
  return {
    id: value.id,
    origin: value.origin === 'builtin' ? 'builtin' : 'user',
    title: value.title,
    description: optionalString(value.description) ?? '',
    steps: parseSteps(value.steps),
    tags: stringArray(value.tags),
    createdAt: optionalString(value.createdAt) ?? now,
    updatedAt: optionalString(value.updatedAt) ?? now,
  }
}

// Last write wins by updatedAt: an older copy never overwrites a newer one.
const upsertStmt = db.prepare(`
  INSERT INTO workflows (id, origin, title, description, steps, tags, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (id) DO UPDATE SET
    title = excluded.title,
    description = excluded.description,
    steps = excluded.steps,
    tags = excluded.tags,
    updated_at = excluded.updated_at
  WHERE excluded.updated_at > workflows.updated_at
`)

/** Inserts the workflow, or replaces the stored copy if this one is newer. Returns whether anything was written. */
export function upsertWorkflow(workflow: WorkflowRecord): boolean {
  // Don't restore a workflow deleted after this copy was last edited.
  if (isDeleted('workflow', workflow.id, workflow.updatedAt)) return false
  const { changes } = upsertStmt.run(
    workflow.id,
    workflow.origin,
    workflow.title,
    workflow.description,
    JSON.stringify(workflow.steps),
    JSON.stringify(workflow.tags),
    workflow.createdAt,
    workflow.updatedAt,
  )
  return Number(changes) > 0
}

function getWorkflow(id: string): WorkflowRecord | undefined {
  const row = db.prepare('SELECT * FROM workflows WHERE id = ?').get(id) as unknown as WorkflowRow | undefined
  return row && rowToWorkflow(row)
}

// GET all workflows
workflowsRouter.get('/', (c) => {
  const stmt = db.prepare('SELECT * FROM workflows ORDER BY created_at DESC')
  const rows = stmt.all() as unknown as WorkflowRow[]
  return c.json(rows.map(rowToWorkflow))
})

// GET single workflow
workflowsRouter.get('/:id', (c) => {
  const workflow = getWorkflow(c.req.param('id'))
  if (!workflow) return c.json({ error: 'Workflow not found' }, 404)
  return c.json(workflow)
})

// POST create workflow. The client generates the id and timestamps.
workflowsRouter.post('/', async (c) => {
  const workflow = parseWorkflow(await readJson(c))
  if (!workflow) return c.json({ error: 'id and title are required' }, 400)
  upsertWorkflow(workflow)
  return c.json(getWorkflow(workflow.id) ?? workflow, 201)
})

// PUT full replacement; creates the workflow if it doesn't exist yet.
workflowsRouter.put('/:id', async (c) => {
  const workflow = parseWorkflow(await readJson(c))
  if (!workflow) return c.json({ error: 'id and title are required' }, 400)
  if (workflow.id !== c.req.param('id')) return c.json({ error: 'Body id does not match URL' }, 400)
  upsertWorkflow(workflow)
  return c.json(getWorkflow(workflow.id) ?? workflow)
})

// DELETE workflow, with its history. `?deletedAt=` is the client's delete time.
workflowsRouter.delete('/:id', (c) => {
  const id = c.req.param('id')
  deleteEntity('workflow', id, c.req.query('deletedAt'))
  return c.json({ success: true, id })
})
