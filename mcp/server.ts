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
import { matchesQuery, normalizeTag } from '../src/lib/search.ts'
import { isUserPrompt } from '../src/lib/userPromptGuard.ts'
import type { Prompt, UserPrompt } from '../src/types/prompt.ts'
import type { Skill } from '../src/types/skill.ts'
import type { TasteEntry } from '../src/types/taste.ts'

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
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

const READ_ONLY = { readOnlyHint: true, idempotentHint: true, openWorldHint: false }

const TOOLS = [
  {
    name: 'search_prompts',
    title: 'Search the prompt library',
    description:
      "Search Prompt Constructor, the prompt library for this team's engineering conventions (environment setup, git and PR workflow, releases and dependencies, code scaffolding, UI and design system, content and i18n, debugging, analytics). It also holds the user's own saved prompts, agent skills (full SKILL.md files), and coding conventions (\"taste\"). Search it before writing things like a PR description, commit message, or release checklist, so the result follows the team's conventions. Every word in `query` must match. Returns names to pass to get_prompt.",
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Words to match in the title, description, tags, source, and text. Leave empty to list everything.',
        },
        tag: { type: 'string', description: 'Only items with this tag, e.g. "pr" or "release".' },
        kind: { type: 'string', enum: [...KINDS], description: 'Only prompts, skills, or taste (conventions). Default "all".' },
        limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, description: `Maximum results. Default ${DEFAULT_LIMIT}.` },
      },
    },
    annotations: READ_ONLY,
  },
  {
    name: 'get_prompt',
    title: 'Get a prompt',
    description:
      'Get the full text of a prompt, skill (as a SKILL.md file), or convention from Prompt Constructor, by the name search_prompts returned. {{VARIABLES}} in the text are filled from `arguments`; any left unfilled are listed so you can ask the user for them.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'The name from search_prompts, e.g. "git-pr-workflow-pr-description".' },
        arguments: {
          type: 'object',
          additionalProperties: { type: 'string' },
          description: 'Values for the {{VARIABLES}}, e.g. {"TICKET_ID": "OPS-512"}.',
        },
      },
      required: ['name'],
    },
    annotations: READ_ONLY,
  },
]

function toolText(...parts: string[]): ToolResult {
  return { content: parts.map((part) => ({ type: 'text' as const, text: part })) }
}

function toolError(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true }
}

interface SearchOptions {
  query: string
  tag?: string
  kind: (typeof KINDS)[number]
}

/**
 * Same rule as the app's search box (every word must appear somewhere), ranked
 * so title and tag hits come before description hits, and those before body-only
 * hits. Ties keep library order, which puts your own items first.
 */
function searchEntries(entries: Entry[], { query, tag, kind }: SearchOptions): Entry[] {
  const wantedTag = tag ? normalizeTag(tag) : ''
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const score = (entry: Entry) =>
    terms.reduce((sum, term) => {
      if (entry.title.toLowerCase().includes(term) || entry.name.includes(term)) return sum + 4
      if (entry.tags.some((t) => t.toLowerCase().includes(term))) return sum + 3
      if (entry.description.toLowerCase().includes(term)) return sum + 2
      return sum
    }, 0)
  return entries
    .filter(
      (entry) =>
        (kind === 'all' || entry.kind === kind) &&
        (!wantedTag || entry.tags.some((t) => normalizeTag(t) === wantedTag)) &&
        matchesQuery([entry.name, entry.title, entry.description, entry.category, entry.source, entry.text, ...entry.tags], query),
    )
    .map((entry) => ({ entry, score: score(entry) }))
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry)
}

function describeEntry(entry: Entry, index: number): string {
  const variables = templateVariables(entry.text)
  const facts = [entry.kind, entry.category, entry.tags.length ? `tags: ${entry.tags.join(', ')}` : ''].filter(Boolean)
  return [
    `${index + 1}. ${entry.name}: ${entry.title}`,
    `   ${facts.join('; ')}`,
    entry.description ? `   ${entry.description}` : '',
    variables.length ? `   variables: ${variables.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

function stringArg(args: Record<string, unknown>, key: string): string | undefined {
  const value = args[key]
  return typeof value === 'string' ? value : undefined
}

function searchTool(entries: Entry[], args: Record<string, unknown>): ToolResult {
  const query = stringArg(args, 'query') ?? ''
  const tag = stringArg(args, 'tag')
  const kindArg = stringArg(args, 'kind') ?? 'all'
  const kind = KINDS.find((k) => k === kindArg)
  if (!kind) return toolError(`\`kind\` must be one of: ${KINDS.join(', ')}.`)
  const rawLimit = typeof args.limit === 'number' ? Math.floor(args.limit) : DEFAULT_LIMIT
  const limit = Math.min(Math.max(rawLimit, 1), MAX_LIMIT)

  const matches = searchEntries(entries, { query, tag, kind })
  const filters = [query && `"${query}"`, tag && `tag "${tag}"`, kind !== 'all' && `kind "${kind}"`].filter(Boolean)
  const scope = filters.length ? ` for ${filters.join(', ')}` : ''
  if (matches.length === 0) {
    return toolText(`No matches${scope}. Try fewer or different words, or drop the tag or kind filter.`)
  }
  const shown = matches.slice(0, limit)
  const count = `${matches.length} ${matches.length === 1 ? 'match' : 'matches'}${scope}`
  const header = `${count}${shown.length < matches.length ? `, showing the first ${shown.length}` : ''}. Pass a name to get_prompt for its full text.`
  return toolText([header, ...shown.map(describeEntry)].join('\n\n'))
}

function getPromptTool(entries: Entry[], args: Record<string, unknown>): ToolResult {
  const name = stringArg(args, 'name')?.trim()
  if (!name) return toolError('`name` is required. Use search_prompts to find one.')
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
    return toolError(`No prompt named "${name}".${hint} Use search_prompts to find names.`)
  }

  const values: Record<string, string> = {}
  if (args.arguments && typeof args.arguments === 'object' && !Array.isArray(args.arguments)) {
    for (const [key, value] of Object.entries(args.arguments)) {
      if (typeof value === 'string') values[key] = value
    }
  }
  const filled = fillTemplate(entry.text, values)
  const unfilled = templateVariables(filled)
  return unfilled.length
    ? toolText(
        filled,
        `Unfilled variables: ${unfilled.join(', ')}. Ask the user for them, or call get_prompt again with "arguments".`,
      )
    : toolText(filled)
}

// ----------------- Server -----------------

const server = new Server(
  { name: 'prompt-constructor', version: '0.1.0' },
  {
    capabilities: { tools: {}, prompts: { listChanged: true }, resources: { listChanged: true } },
    instructions:
      "Prompt Constructor is this team's library of engineering-convention prompts, agent skills, and coding conventions, plus the user's own saved ones. When a task has a team convention (PR descriptions, commit messages, release checklists, scaffolding, i18n, design-system mapping, debugging, analytics), call search_prompts, then get_prompt with any variables filled in, and follow what it returns.",
  },
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
