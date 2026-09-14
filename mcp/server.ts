// Local MCP server for Prompt Constructor, over stdio. Run with `npm run mcp`
// or point an MCP client at it (see the MCP dialog in the app).
//
// Node (22.18+) runs this TypeScript directly via type stripping, so every
// file it imports must use `import type` for types and explicit `.ts` paths.
// Reads content fresh on each request: built-ins from src/data, saved prompts
// from the file the dev server mirrors out of localStorage.

import { watch } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  ErrorCode,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { BUILT_IN_PROMPTS } from '../src/data/prompts.ts'
import { SKILLS } from '../src/data/skills.ts'
import { TASTE_ENTRIES } from '../src/data/taste.ts'
import { fillTemplate, formatSkillMarkdown, skillPath, templateVariables } from '../src/lib/formatContent.ts'
import { isUserPrompt } from '../src/lib/userPromptGuard.ts'
import type { Prompt, UserPrompt } from '../src/types/prompt.ts'
import { SAVED_PROMPTS_FILE } from './paths.ts'

/** One item exposed as both an MCP prompt and an MCP resource. */
interface Entry {
  name: string
  uri: string
  title: string
  description: string
  text: string
}

async function loadSavedPrompts(): Promise<UserPrompt[]> {
  try {
    const data: unknown = JSON.parse(await readFile(SAVED_PROMPTS_FILE, 'utf8'))
    return Array.isArray(data) ? data.filter(isUserPrompt) : []
  } catch {
    // No file until the app has run under `npm run dev` at least once.
    return []
  }
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function promptEntry(prompt: Prompt): Entry {
  const saved = prompt.origin === 'user'
  return {
    // Saved ids are random, so add a short suffix to keep readable names unique.
    name: saved ? `saved-${slug(prompt.title) || 'prompt'}-${prompt.id.slice(-6)}` : slug(prompt.id),
    uri: `prompt-constructor://prompts/${encodeURIComponent(prompt.id)}`,
    title: saved ? `${prompt.title} (saved)` : prompt.title,
    description: prompt.description,
    text: prompt.body,
  }
}

async function loadEntries(): Promise<Entry[]> {
  const prompts: Prompt[] = [...(await loadSavedPrompts()), ...BUILT_IN_PROMPTS]
  return [
    ...prompts.map(promptEntry),
    ...SKILLS.map((skill) => ({
      name: `skill-${skill.name}`,
      uri: `prompt-constructor://skills/${skill.name}`,
      title: `Skill: ${skill.title}`,
      description: `${skill.description} Install at ${skillPath(skill)}.`,
      text: formatSkillMarkdown(skill),
    })),
    ...TASTE_ENTRIES.map((entry) => ({
      name: `taste-${entry.id}`,
      uri: `prompt-constructor://taste/${entry.id}`,
      title: `Taste: ${entry.title}`,
      description: entry.description,
      text: entry.body,
    })),
  ]
}

const server = new Server(
  { name: 'prompt-constructor', version: '0.1.0' },
  { capabilities: { prompts: { listChanged: true }, resources: { listChanged: true } } },
)

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: (await loadEntries()).map((entry) => ({
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
  const entry = (await loadEntries()).find((e) => e.name === request.params.name)
  if (!entry) throw new McpError(ErrorCode.InvalidParams, `Unknown prompt: ${request.params.name}`)
  return {
    description: entry.description,
    messages: [
      { role: 'user', content: { type: 'text', text: fillTemplate(entry.text, request.params.arguments ?? {}) } },
    ],
  }
})

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: (await loadEntries()).map((entry) => ({
    uri: entry.uri,
    name: entry.name,
    title: entry.title,
    description: entry.description,
    mimeType: 'text/markdown',
  })),
}))

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const entry = (await loadEntries()).find((e) => e.uri === request.params.uri)
  if (!entry) throw new McpError(ErrorCode.InvalidParams, `Unknown resource: ${request.params.uri}`)
  return { contents: [{ uri: entry.uri, mimeType: 'text/markdown', text: entry.text }] }
})

await server.connect(new StdioServerTransport())

// Tell clients to re-list when the app syncs new saved prompts.
await mkdir(dirname(SAVED_PROMPTS_FILE), { recursive: true })
let notifyTimer: NodeJS.Timeout | undefined
watch(dirname(SAVED_PROMPTS_FILE), () => {
  clearTimeout(notifyTimer)
  notifyTimer = setTimeout(() => {
    server.sendPromptListChanged().catch(() => {})
    server.sendResourceListChanged().catch(() => {})
  }, 200)
})

// stdout carries the protocol, so log to stderr.
console.error('prompt-constructor MCP server running on stdio')
