import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, test } from 'node:test'

// Runs the API in-process (Hono's app.request) against a throwaway database.

const dir = mkdtempSync(join(tmpdir(), 'prompt-constructor-api-'))
// Set before the server modules load: db.ts reads DB_PATH, and index.ts doesn't listen in tests.
process.env.DB_PATH = join(dir, 'test.db')
process.env.NODE_ENV = 'test'
const { app } = await import('../server/index.ts')

after(() => rmSync(dir, { recursive: true, force: true }))

const T1 = '2026-01-01T00:00:00.000Z'
const T2 = '2026-01-02T00:00:00.000Z'
const T3 = '2026-01-03T00:00:00.000Z'
const FUTURE = '2099-01-01T00:00:00.000Z'
const JSON_HEADERS = { 'Content-Type': 'application/json' }
const EVIL_ORIGIN = { Origin: 'https://evil.example' }

async function send(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
  return app.request(path, {
    method,
    headers: body === undefined ? headers : { ...JSON_HEADERS, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function read<T>(response: Response | Promise<Response>): Promise<T> {
  return (await response).json() as Promise<T>
}

async function exists(path: string): Promise<boolean> {
  return (await app.request(path)).status === 200
}

const promptPath = (id: string) => `/api/prompts/${encodeURIComponent(`saved/${id}`)}`
const historyPath = (id: string) => `/api/history/prompt/${encodeURIComponent(`saved/${id}`)}`

function prompt(id: string, updatedAt = T1, extra: Record<string, unknown> = {}) {
  return { id: `saved/${id}`, origin: 'user', title: id, description: '', tags: [], body: 'body', createdAt: T1, updatedAt, ...extra }
}

function history(id: string, updatedAt: string, revisionCount = 2) {
  return {
    entityType: 'prompt',
    entityId: `saved/${id}`,
    title: id,
    originalSnapshot: {},
    currentSnapshot: {},
    currentVersionNumber: revisionCount - 1,
    revisions: Array.from({ length: revisionCount }, (_, versionNumber) => ({ versionNumber })),
    createdAt: T1,
    updatedAt,
  }
}

async function favorites(): Promise<string[]> {
  return read<string[]>(app.request('/api/favorites'))
}

describe("only this machine's own app can call the API", () => {
  test('a cross-site text/plain POST (sent without a CORS preflight) is refused and changes nothing', async () => {
    await send('POST', '/api/prompts', prompt('csrf-victim'))
    const response = await app.request('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', ...EVIL_ORIGIN },
      body: JSON.stringify({ deletions: [{ entityType: 'prompt', entityId: 'saved/csrf-victim', deletedAt: T3 }] }),
    })
    assert.equal(response.status, 403)
    assert.ok(await exists(promptPath('csrf-victim')))
  })

  test('a non-JSON write is refused even without an Origin, since only JSON forces a preflight', async () => {
    const response = await app.request('/api/sync', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' })
    assert.equal(response.status, 415)
  })

  test('any request from a foreign Origin is refused: writes with or without a body, deletes, and reads', async () => {
    assert.equal((await send('POST', '/api/prompts', prompt('evil'), EVIL_ORIGIN)).status, 403)
    const bodyless = await app.request('/api/favorites/anything', { method: 'POST', headers: { ...JSON_HEADERS, ...EVIL_ORIGIN } })
    assert.equal(bodyless.status, 403)
    assert.equal((await send('DELETE', promptPath('csrf-victim'), undefined, EVIL_ORIGIN)).status, 403)
    assert.equal((await app.request('/api/favorites', { headers: EVIL_ORIGIN })).status, 403)
    assert.ok(await exists(promptPath('csrf-victim')))
    assert.deepEqual(await favorites(), [])
  })

  test('a sandboxed or file:// page (Origin: null) is refused', async () => {
    assert.equal((await app.request('/api/health', { headers: { Origin: 'null' } })).status, 403)
  })

  test('a request addressed to another host name (DNS rebinding) is refused', async () => {
    assert.equal((await app.request('http://evil.example:3001/api/health')).status, 403)
  })

  test('the app on any local port, and tools that send no Origin, are allowed', async () => {
    const fromApp = await app.request('/api/health', { headers: { Origin: 'http://localhost:5174' } })
    assert.equal(fromApp.status, 200)
    assert.equal(fromApp.headers.get('access-control-allow-origin'), 'http://localhost:5174')
    assert.equal((await app.request('/api/health')).status, 200)
  })
})

describe("timestamps can't be used to pin a record", () => {
  test('a future updatedAt is rejected, so it cannot win every later merge', async () => {
    assert.equal((await send('POST', '/api/prompts', prompt('future', FUTURE))).status, 400)
    assert.equal(await exists(promptPath('future')), false)
  })

  test('a malformed updatedAt is rejected', async () => {
    assert.equal((await send('POST', '/api/prompts', prompt('malformed', 'zzz'))).status, 400)
  })

  test('a future tombstone sent to /sync is skipped', async () => {
    await send('POST', '/api/prompts', prompt('pinned'))
    const deletion = { entityType: 'prompt', entityId: 'saved/pinned', deletedAt: FUTURE }
    const result = await read<{ synced: Record<string, number> }>(send('POST', '/api/sync', { deletions: [deletion] }))
    assert.equal(result.synced.deletions, 0)
    assert.ok(await exists(promptPath('pinned')))
  })

  test('a future deletedAt on DELETE falls back to now, so the item can be re-created later', async () => {
    await send('POST', '/api/prompts', prompt('delete-future'))
    await send('DELETE', `${promptPath('delete-future')}?deletedAt=${FUTURE}`)
    assert.equal(await exists(promptPath('delete-future')), false)
    const later = new Date(Date.now() + 1000).toISOString()
    assert.equal((await send('PUT', promptPath('delete-future'), prompt('delete-future', later))).status, 200)
    assert.ok(await exists(promptPath('delete-future')))
  })
})

describe('records', () => {
  test('missing required fields or malformed JSON give 400, not 500', async () => {
    assert.equal((await send('POST', '/api/prompts', {})).status, 400)
    const malformed = await app.request('/api/prompts', { method: 'POST', headers: JSON_HEADERS, body: 'not json' })
    assert.equal(malformed.status, 400)
  })

  test('last write wins by updatedAt, and a field left out of the full record is cleared', async () => {
    assert.equal((await send('POST', '/api/prompts', prompt('crud', T1, { category: 'git-pr-workflow' }))).status, 201)
    assert.equal((await send('POST', '/api/prompts', prompt('crud'))).status, 201, 'a duplicate create is a no-op, not a 500')
    const stale = await read<{ title: string }>(send('PUT', promptPath('crud'), prompt('crud', '2025-12-31T00:00:00.000Z', { title: 'stale' })))
    assert.equal(stale.title, 'crud')
    const newer = await read<{ title: string; category?: string }>(send('PUT', promptPath('crud'), prompt('crud', T2, { title: 'newer' })))
    assert.equal(newer.title, 'newer')
    assert.equal(newer.category, undefined)
  })

  test('PUT must target the id in its body, and creates the record if it does not exist yet', async () => {
    assert.equal((await send('PUT', promptPath('other'), prompt('mismatch'))).status, 400)
    assert.equal((await send('PUT', promptPath('made-offline'), prompt('made-offline'))).status, 200)
    assert.ok(await exists(promptPath('made-offline')))
  })

  test('renaming a skill moves its row', async () => {
    await send('POST', '/api/skills', { name: 'old-name', title: 'S', body: 'b', updatedAt: T1 })
    await send('PUT', '/api/skills/old-name', { name: 'new-name', title: 'S', body: 'b', updatedAt: T2 })
    assert.equal(await exists('/api/skills/old-name'), false)
    assert.ok(await exists('/api/skills/new-name'))
  })

  test('history is stored as sent, and an older copy is ignored', async () => {
    await send('PUT', historyPath('with-history'), history('with-history', T2, 3))
    const kept = await read<{ revisions: unknown[] }>(send('PUT', historyPath('with-history'), history('with-history', T1, 1)))
    assert.equal(kept.revisions.length, 3)
  })
})

describe('deletes', () => {
  test("a delete removes the item, its history, and its star, but not other stars", async () => {
    await send('POST', '/api/prompts', prompt('doomed'))
    await send('POST', '/api/favorites/saved%2Fdoomed', undefined, JSON_HEADERS)
    await send('POST', '/api/favorites/git-pr-workflow%2Fbuiltin', undefined, JSON_HEADERS)
    await send('PUT', historyPath('doomed'), history('doomed', T1))
    assert.equal((await send('DELETE', `${promptPath('doomed')}?deletedAt=${T2}`)).status, 200)
    assert.equal(await exists(promptPath('doomed')), false)
    assert.equal(await exists(historyPath('doomed')), false)
    assert.deepEqual(await favorites(), ['git-pr-workflow/builtin'])
    const tombstones = await read<{ entityId: string; deletedAt: string }[]>(app.request('/api/deletions'))
    assert.equal(tombstones.find((d) => d.entityId === 'saved/doomed')?.deletedAt, T2)
  })

  test('older copies cannot bring a deleted item back', async () => {
    await send('PUT', promptPath('doomed'), prompt('doomed', T1))
    await send('POST', '/api/prompts', prompt('doomed', T2))
    await send('PUT', historyPath('doomed'), history('doomed', T1))
    await send('POST', '/api/favorites/saved%2Fdoomed', undefined, JSON_HEADERS)
    assert.equal(await exists(promptPath('doomed')), false)
    assert.equal(await exists(historyPath('doomed')), false)
    assert.deepEqual(await favorites(), ['git-pr-workflow/builtin'])
  })

  test('an edit newer than the delete re-creates the item', async () => {
    await send('PUT', promptPath('doomed'), prompt('doomed', T3))
    assert.ok(await exists(promptPath('doomed')))
  })

  test('a delete older than the stored edit keeps the item', async () => {
    await send('POST', '/api/workflows', { id: 'user-workflow/kept', title: 'W', steps: [], createdAt: T1, updatedAt: T3 })
    await send('DELETE', `/api/workflows/${encodeURIComponent('user-workflow/kept')}?deletedAt=${T2}`)
    assert.ok(await exists(`/api/workflows/${encodeURIComponent('user-workflow/kept')}`))
  })

  test('/sync applies tombstones before upserts, skips invalid ones, and resending is a no-op', async () => {
    const payload = {
      deletions: [
        { entityType: 'skill', entityId: 'synced-skill', deletedAt: T2 },
        { entityType: 'bogus', entityId: 'x', deletedAt: T2 },
        { entityType: 'toString', entityId: 'x', deletedAt: T2 },
        { entityType: 'prompt', entityId: 'x', deletedAt: 'not-a-date' },
      ],
      skills: [{ name: 'synced-skill', title: 'S', body: 'b', createdAt: T1, updatedAt: T1 }],
    }
    const first = await read<{ synced: Record<string, number> }>(send('POST', '/api/sync', payload))
    assert.deepEqual(first.synced, { deletions: 1, prompts: 0, workflows: 0, skills: 0, taste: 0, favorites: 0, history: 0 })
    assert.equal(await exists('/api/skills/synced-skill'), false)
    const second = await read<{ synced: Record<string, number> }>(send('POST', '/api/sync', payload))
    assert.equal(second.synced.deletions, 0)
  })
})
