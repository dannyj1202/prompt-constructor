import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { PromptListChangedNotificationSchema } from '@modelcontextprotocol/sdk/types.js'

// Starts the real MCP server (mcp/server.ts) as a child process, the way an MCP client does,
// against a throwaway database seeded through the API's own write functions.

const SERVER = fileURLToPath(new URL('../mcp/server.ts', import.meta.url))
const dir = mkdtempSync(join(tmpdir(), 'prompt-constructor-mcp-'))
const DB = join(dir, 'test.db')
process.env.DB_PATH = DB
process.env.NODE_ENV = 'test'

const { upsertPrompt } = await import('../server/routes/prompts.ts')
const { upsertSkill } = await import('../server/routes/skills.ts')
const { upsertTaste } = await import('../server/routes/taste.ts')
const { upsertHistory } = await import('../server/routes/history.ts')
const { deleteEntity } = await import('../server/routes/deletions.ts')
const { BUILT_IN_PROMPTS } = await import('../src/data/prompts.ts')

const T1 = '2026-01-01T00:00:00.000Z'
const T2 = '2026-01-02T00:00:00.000Z'
const BUILT_IN = BUILT_IN_PROMPTS[0]
const BUILT_IN_NAME = BUILT_IN.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')

function userPrompt(id: string, title: string, body = 'body') {
  return { id, origin: 'user' as const, title, description: title, tags: [], body, createdAt: T1, updatedAt: T1 }
}

upsertPrompt(userPrompt('saved/mine01', 'My prompt', 'Fix {{TICKET_ID}} now'))
upsertPrompt(userPrompt('saved/gone01', 'Gone prompt'))
deleteEntity('prompt', 'saved/gone01', T2)
upsertSkill({ name: 'my-skill', origin: 'user', title: 'My skill', description: 'Does things.', tags: [], source: '.cursor/skills/my-skill/SKILL.md', body: 'Skill body', createdAt: T1, updatedAt: T1 })
upsertTaste({ id: 'user-taste/mine01', origin: 'user', title: 'My taste', description: 'Taste.', tags: [], source: 'Mine', body: 'Taste body', createdAt: T1, updatedAt: T1 })
// An edit to a built-in lives only in its history record.
upsertHistory({
  entityType: 'prompt',
  entityId: BUILT_IN.id,
  title: BUILT_IN.title,
  originalSnapshot: BUILT_IN,
  currentSnapshot: { ...BUILT_IN, body: 'EDITED BODY' },
  currentVersionNumber: 1,
  revisions: [{ versionNumber: 0 }, { versionNumber: 1 }],
  createdAt: T1,
  updatedAt: T1,
})

async function connect(dbPath: string): Promise<Client> {
  const client = new Client({ name: 'prompt-constructor-test', version: '0.0.0' })
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER],
    env: { PATH: process.env.PATH ?? '', DB_PATH: dbPath },
    stderr: 'ignore',
  })
  await client.connect(transport)
  return client
}

async function promptNames(client: Client): Promise<string[]> {
  return (await client.listPrompts()).prompts.map((prompt) => prompt.name)
}

async function promptText(client: Client, name: string, args?: Record<string, string>): Promise<string> {
  const result = await client.getPrompt({ name, arguments: args })
  const content = result.messages[0]?.content
  assert.equal(content?.type, 'text')
  return (content as { text: string }).text
}

let client: Client

before(async () => {
  client = await connect(DB)
})

after(async () => {
  await client?.close()
  rmSync(dir, { recursive: true, force: true })
})

describe('MCP server', () => {
  test('serves the built-ins plus your own prompts, skills, and taste entries from the database', async () => {
    const prompts = (await client.listPrompts()).prompts
    const names = prompts.map((prompt) => prompt.name)
    assert.ok(names.includes(BUILT_IN_NAME))
    assert.ok(names.includes('saved-my-prompt-mine01'))
    assert.ok(names.includes('skill-my-skill'))
    assert.ok(names.includes('taste-user-taste-mine01'))
    assert.equal(prompts.find((p) => p.name === 'saved-my-prompt-mine01')?.title, 'My prompt (saved)')
    assert.equal(prompts.find((p) => p.name === 'skill-my-skill')?.title, 'Skill: My skill (custom)')
  })

  test('a deleted item is not served', async () => {
    assert.ok(!(await promptNames(client)).some((name) => name.startsWith('saved-gone-prompt')))
  })

  test('{{VARIABLES}} become arguments and are filled in', async () => {
    const listed = (await client.listPrompts()).prompts.find((p) => p.name === 'saved-my-prompt-mine01')
    assert.deepEqual(listed?.arguments?.map((arg) => arg.name), ['TICKET_ID'])
    assert.equal(await promptText(client, 'saved-my-prompt-mine01', { TICKET_ID: 'ABC-1' }), 'Fix ABC-1 now')
  })

  test('an edited built-in is served with your edit, and labelled as edited', async () => {
    assert.equal(await promptText(client, BUILT_IN_NAME), 'EDITED BODY')
    const listed = (await client.listPrompts()).prompts.find((p) => p.name === BUILT_IN_NAME)
    assert.equal(listed?.title, `${BUILT_IN.title} (edited)`)
  })

  test('a skill is also a resource, served as a full SKILL.md file', async () => {
    const result = await client.readResource({ uri: 'prompt-constructor://skills/my-skill' })
    const content = result.contents[0] as { text?: string }
    assert.ok(content.text?.startsWith('---\nname: my-skill\n'))
    assert.ok(content.text?.includes('Skill body'))
  })

  test('tells clients to re-list when the database changes, and serves the new item', async () => {
    const changed = new Promise<void>((resolve) => {
      client.setNotificationHandler(PromptListChangedNotificationSchema, () => resolve())
    })
    upsertPrompt(userPrompt('saved/new001', 'New prompt'))
    let timer: NodeJS.Timeout | undefined
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('no prompts/list_changed notification within 5s')), 5000)
    })
    await Promise.race([changed, timeout]).finally(() => clearTimeout(timer))
    assert.ok((await promptNames(client)).includes('saved-new-prompt-new001'))
  })

  test('with no database yet, the built-ins are still served', async () => {
    const fresh = await connect(join(dir, 'not-created-yet', 'none.db'))
    try {
      const names = await promptNames(fresh)
      assert.ok(names.includes(BUILT_IN_NAME))
      assert.ok(!names.some((name) => name.startsWith('saved-')))
      assert.notEqual(await promptText(fresh, BUILT_IN_NAME), 'EDITED BODY')
    } finally {
      await fresh.close()
    }
  })
})
