// Local MCP server for Prompt Constructor, over stdio. Run with `npm run mcp`
// or point an MCP client at it (see the MCP dialog in the app).
//
// Node (22.18+) runs this TypeScript directly via type stripping, so every
// file it imports must use `import type` for types and explicit `.ts` paths.
// Reads content fresh on each request: built-ins from src/data, plus your own
// prompts, skills, and taste entries and your edits to built-ins from the
// API's SQLite database (opened read-only; the API is the only writer).
//
// Everything is offered three ways: tools an agent can call on its own
// (search_prompts, get_prompt), MCP prompts a person picks, and resources.
// The tools are deliberately lean: clients keep tool definitions in the
// model's context on every turn, so descriptions are one sentence, results
// are one line each, and there are no server instructions.

import { existsSync, watch } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { basename, dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  type CallToolResult,
  ErrorCode,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { DB_PATH } from '../server/dbPath.ts'
import { BUILT_IN_PROMPTS } from '../src/data/prompts.ts'
import { SKILLS } from '../src/data/skills.ts'
import { TASTE_ENTRIES } from '../src/data/taste.ts'
import { fillTemplate, formatSkillMarkdown, skillPath, templateVariables } from '../src/lib/formatContent.ts'
import { normalizeTag } from '../src/lib/search.ts'
import { isUserPrompt } from '../src/lib/userPromptGuard.ts'
import type { Prompt, UserPrompt } from '../src/types/prompt.ts'
import type { Skill } from '../src/types/skill.ts'
import type { TasteEntry } from '../src/types/taste.ts'
import { searchLibrary } from './search.ts'

type EntryKind = 'prompt' | 'skill' | 'taste'

/** One item, exposed as a tool result, an MCP prompt, and an MCP resource. */
interface Entry {
  name: string
  uri: string
  title: string
  description: string
  text: string
  kind: EntryKind
  tags: string[]
  /** Category id, for prompts. */
  category?: string
  /** The repo file or convention it's based on. */
  source?: string
}

/** What the app has saved beyond the built-ins. */
interface StoredContent {
  prompts: UserPrompt[]
  skills: Skill[]
  taste: TasteEntry[]
  /** Current snapshot of each edited item, keyed `"<type>:<id>"` like the entity_history table. */
  edits: Map<string, Record<string, unknown>>
}

type Row = Record<string, unknown>

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function jsonStrings(value: unknown): string[] {
  try {
    const parsed: unknown = JSON.parse(text(value) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

function origin(value: unknown): 'user' | 'builtin' {
  return value === 'builtin' ? 'builtin' : 'user'
}

/**
 * Reads what the app has saved. The database is opened per request so each one
 * sees the latest data and no lock is held between requests. Until the API has
 * created the database, there's nothing beyond the built-ins.
 */
function readStoredContent(): StoredContent {
  const empty: StoredContent = { prompts: [], skills: [], taste: [], edits: new Map() }
  if (!existsSync(DB_PATH)) return empty

  let db: DatabaseSync | undefined
  try {
    const conn = new DatabaseSync(DB_PATH, { readOnly: true })
    db = conn
    // The API may be mid-write; wait briefly rather than fail the request.
    conn.exec('PRAGMA busy_timeout = 2000')
    const all = (sql: string) => conn.prepare(sql).all() as Row[]

    const prompts = all('SELECT * FROM prompts ORDER BY created_at DESC')
      // `unknown` so the guard below narrows to UserPrompt (and drops anything malformed).
      .map((row): unknown => ({
        id: text(row.id),
        origin: origin(row.origin),
        title: text(row.title),
        description: text(row.description),
        category: text(row.category) || undefined,
        tags: jsonStrings(row.tags),
        source: text(row.source) || undefined,
        body: text(row.body),
        createdAt: text(row.created_at),
        updatedAt: text(row.updated_at),
      }))
      .filter(isUserPrompt)

    const skills: Skill[] = all('SELECT * FROM skills ORDER BY created_at DESC').map((row) => ({
      name: text(row.name),
      origin: origin(row.origin),
      title: text(row.title),
      description: text(row.description),
      tags: jsonStrings(row.tags),
      source: text(row.source) || `.cursor/skills/${text(row.name)}/SKILL.md`,
      body: text(row.body),
      createdAt: text(row.created_at),
      updatedAt: text(row.updated_at),
    }))

    const taste: TasteEntry[] = all('SELECT * FROM taste ORDER BY created_at DESC').map((row) => ({
      id: text(row.id),
      origin: origin(row.origin),
      title: text(row.title),
      description: text(row.description),
      tags: jsonStrings(row.tags),
      source: text(row.source) || 'AGENTS.md',
      body: text(row.body),
      createdAt: text(row.created_at),
      updatedAt: text(row.updated_at),
    }))

    const edits = new Map<string, Record<string, unknown>>()
    for (const row of all('SELECT id, current_snapshot FROM entity_history')) {
      try {
        const snapshot: unknown = JSON.parse(text(row.current_snapshot))
        if (snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot)) {
          edits.set(text(row.id), snapshot as Record<string, unknown>)
        }
      } catch {
        // Skip a corrupt history record rather than fail the whole listing.
      }
    }

    return { prompts, skills, taste, edits }
  } catch (error) {
    // stdout carries the protocol, so log to stderr.
    console.error(`prompt-constructor MCP: couldn't read ${DB_PATH}:`, error instanceof Error ? error.message : error)
    return empty
  } finally {
    db?.close()
  }
}

/**
 * The item as the app shows it: its current edit-history snapshot laid over it.
 * A snapshot without a usable title and body is ignored.
 */
function withEdits<T extends { title: string; body: string }>(item: T, edit: Record<string, unknown> | undefined): T {
  if (!edit) return item
  const edited = { ...item, ...edit }
  return typeof edited.title === 'string' && typeof edited.body === 'string' ? edited : item
}

/** First item per key; your own items come first, so they win a clash with a built-in. */
function uniqueBy<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyOf(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** "(saved)" / "(custom)" match the app's badges; "(edited)" marks a built-in you've changed. */
function titleSuffix(item: { origin?: string }, edited: boolean, userLabel: string): string {
  if (item.origin === 'user') return ` (${userLabel})`
  return edited ? ' (edited)' : ''
}

function promptEntry(prompt: Prompt, edited: boolean): Entry {
  const saved = prompt.origin === 'user'
  return {
    // Saved ids are random, so add a short suffix to keep readable names unique.
    name: saved ? `saved-${slug(prompt.title) || 'prompt'}-${prompt.id.slice(-6)}` : slug(prompt.id),
    uri: `prompt-constructor://prompts/${encodeURIComponent(prompt.id)}`,
    title: `${prompt.title}${titleSuffix(prompt, edited, 'saved')}`,
    description: prompt.description,
    text: prompt.body,
    kind: 'prompt',
    tags: prompt.tags,
    category: prompt.category,
    source: prompt.source,
  }
}

function skillEntry(skill: Skill, edited: boolean): Entry {
  return {
    name: `skill-${slug(skill.name)}`,
    uri: `prompt-constructor://skills/${encodeURIComponent(skill.name)}`,
    title: `Skill: ${skill.title}${titleSuffix(skill, edited, 'custom')}`,
    description: `${skill.description} Install at ${skillPath(skill)}.`,
    text: formatSkillMarkdown(skill),
    kind: 'skill',
    tags: skill.tags,
    source: skill.source,
  }
}

function tasteEntry(entry: TasteEntry, edited: boolean): Entry {
  return {
    name: `taste-${slug(entry.id)}`,
    uri: `prompt-constructor://taste/${encodeURIComponent(entry.id)}`,
    title: `Taste: ${entry.title}${titleSuffix(entry, edited, 'custom')}`,
    description: entry.description,
    text: entry.body,
    kind: 'taste',
    tags: entry.tags,
    source: entry.source,
  }
}

function loadEntries(): Entry[] {
  const { prompts, skills, taste, edits } = readStoredContent()
  const prompt = (p: Prompt) => promptEntry(withEdits(p, edits.get(`prompt:${p.id}`)), edits.has(`prompt:${p.id}`))
  const skill = (s: Skill) => skillEntry(withEdits(s, edits.get(`skill:${s.name}`)), edits.has(`skill:${s.name}`))
  const tasteItem = (t: TasteEntry) => tasteEntry(withEdits(t, edits.get(`taste:${t.id}`)), edits.has(`taste:${t.id}`))
  return [
    ...[...prompts, ...BUILT_IN_PROMPTS].map(prompt),
    ...uniqueBy([...skills, ...SKILLS], (s) => s.name).map(skill),
    ...uniqueBy([...taste, ...TASTE_ENTRIES], (t) => t.id).map(tasteItem),
  ]
}

// ----------------- Tools (for agents) -----------------

type ToolResult = CallToolResult

const KINDS = ['all', 'prompt', 'skill', 'taste'] as const
const DEFAULT_LIMIT = 5
const MAX_LIMIT = 20
const DESCRIPTION_PREVIEW = 90

const READ_ONLY = { readOnlyHint: true, idempotentHint: true, openWorldHint: false }

// Every word here sits in the model's context on every turn: only what it needs to pick and call a tool.
const TOOLS = [
  {
    name: 'search_prompts',
    description:
      "Find the team's convention prompts (PR descriptions, commits, releases, setup, scaffolding, i18n, design system, debugging, analytics) and the user's saved prompts, skills, and conventions. Returns names for get_prompt.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Keywords, e.g. "pr description"' },
        tag: { type: 'string' },
        kind: { type: 'string', enum: [...KINDS] },
        limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT },
      },
    },
    annotations: READ_ONLY,
  },
  {
    name: 'get_prompt',
    description: 'Get a prompt by name, with {{VARIABLES}} filled from arguments. Follow the returned text.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' },
        arguments: { type: 'object', additionalProperties: { type: 'string' } },
      },
      required: ['name'],
    },
    annotations: READ_ONLY,
  },
]

function toolText(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }] }
}

function toolError(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true }
}

/** One compact line per result: enough to pick the right one without fetching it. */
function resultLine(entry: Entry): string {
  const about =
    entry.description.length > DESCRIPTION_PREVIEW
      ? `${entry.description.slice(0, DESCRIPTION_PREVIEW - 1).trimEnd()}…`
      : entry.description
  const variables = templateVariables(entry.text)
  return `- ${entry.name}: ${entry.title}${about ? ` - ${about}` : ''}${variables.length ? ` [vars: ${variables.join(', ')}]` : ''}`
}

function stringArg(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key]
  return typeof value === 'string' ? value : undefined
}

function searchTool(entries: Entry[], args: Record<string, unknown>): ToolResult {
  const kindArg = stringArg(args, 'kind') ?? 'all'
  const kind = KINDS.find((k) => k === kindArg)
  if (!kind) return toolError(`kind must be one of: ${KINDS.join(', ')}`)
  const tag = stringArg(args, 'tag')
  const wantedTag = tag ? normalizeTag(tag) : ''
  const rawLimit = typeof args.limit === 'number' ? Math.floor(args.limit) : DEFAULT_LIMIT
  const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT)

  const pool = entries.filter(
    (entry) =>
      (kind === 'all' || entry.kind === kind) &&
      (!wantedTag || entry.tags.some((t) => normalizeTag(t) === wantedTag)),
  )
  const { items, exact } = searchLibrary(pool, stringArg(args, 'query') ?? '')
  if (items.length === 0) return toolText('No matches. Try other keywords.')

  const shown = items.slice(0, limit)
  const header = exact
    ? `${items.length} ${items.length === 1 ? 'match' : 'matches'}${shown.length < items.length ? `, top ${shown.length}` : ''}:`
    : 'No exact match. Closest:'
  return toolText([header, ...shown.map(resultLine)].join('\n'))
}

function getPromptTool(entries: Entry[], args: Record<string, unknown>): ToolResult {
  const name = stringArg(args, 'name')?.trim()
  if (!name) return toolError('name is required (from search_prompts)')
  const entry = entries.find((e) => e.name === name || e.uri === name)
  if (!entry) {
    // Match on each word's first five letters, so a misspelled ending still finds the right item.
    const stems = name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2)
      .map((word) => word.slice(0, 5))
    const suggestions = entries
      .map((e) => ({ e, hits: stems.filter((stem) => e.name.includes(stem)).length }))
      .filter(({ hits }) => hits > 0)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 3)
      .map(({ e }) => e.name)
    const hint = suggestions.length ? ` Did you mean: ${suggestions.join(', ')}?` : ''
    return toolError(`No prompt named "${name}".${hint} Otherwise use search_prompts.`)
  }

  const values: Record<string, string> = {}
  if (args.arguments && typeof args.arguments === 'object' && !Array.isArray(args.arguments)) {
    for (const [key, value] of Object.entries(args.arguments)) {
      if (typeof value === 'string') values[key] = value
    }
  }
  const filled = fillTemplate(entry.text, values)
  const missing = templateVariables(filled)
  return toolText(missing.length ? `${filled}\n\nMissing: ${missing.join(', ')} (pass in arguments)` : filled)
}

// ----------------- Server -----------------

const server = new Server(
  { name: 'prompt-constructor', version: '0.1.0' },
  // No `instructions`: clients add them to the model's context on every turn, and the tool
  // descriptions already say when to use the tools.
  { capabilities: { tools: {}, prompts: { listChanged: true }, resources: { listChanged: true } } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const args = request.params.arguments ?? {}
  switch (request.params.name) {
    case 'search_prompts':
      return searchTool(loadEntries(), args)
    case 'get_prompt':
      return getPromptTool(loadEntries(), args)
    default:
      throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${request.params.name}`)
  }
})

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: loadEntries().map((entry) => ({
    name: entry.name,
    title: entry.title,
    description: entry.description,
    // {{VARIABLES}} in the text become optional arguments.
    arguments: templateVariables(entry.text).map((variable) => ({
      name: variable,
      description: `Replaces {{${variable}}}`,
      required: false,
    })),
  })),
}))

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const entry = loadEntries().find((e) => e.name === request.params.name)
  if (!entry) throw new McpError(ErrorCode.InvalidParams, `Unknown prompt: ${request.params.name}`)
  return {
    description: entry.description,
    messages: [
      { role: 'user', content: { type: 'text', text: fillTemplate(entry.text, request.params.arguments ?? {}) } },
    ],
  }
})

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: loadEntries().map((entry) => ({
    uri: entry.uri,
    name: entry.name,
    title: entry.title,
    description: entry.description,
    mimeType: 'text/markdown',
  })),
}))

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const entry = loadEntries().find((e) => e.uri === request.params.uri)
  if (!entry) throw new McpError(ErrorCode.InvalidParams, `Unknown resource: ${request.params.uri}`)
  return { contents: [{ uri: entry.uri, mimeType: 'text/markdown', text: entry.text }] }
})

await server.connect(new StdioServerTransport())

// Tell clients to re-list whenever the database (or its journal) changes.
await mkdir(dirname(DB_PATH), { recursive: true })
const dbFile = basename(DB_PATH)
let notifyTimer: NodeJS.Timeout | undefined
watch(dirname(DB_PATH), (_event, filename) => {
  if (filename && !filename.startsWith(dbFile)) return
  clearTimeout(notifyTimer)
  notifyTimer = setTimeout(() => {
    server.sendPromptListChanged().catch(() => {})
    server.sendResourceListChanged().catch(() => {})
  }, 200)
})

console.error(`prompt-constructor MCP server running on stdio (database: ${DB_PATH})`)
