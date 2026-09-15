import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { makeIsDeleted, mergeByUpdatedAt, mergeDeletions } from '../src/lib/merge.ts'

// The startup sync's merge rules (src/lib/syncManager.ts), tested as pure functions.

const T1 = '2026-01-01T00:00:00.000Z'
const T2 = '2026-01-02T00:00:00.000Z'
const T3 = '2026-01-03T00:00:00.000Z'

interface Item {
  id: string
  v: string
  createdAt?: string
  updatedAt?: string
}
const keyOf = (item: Item) => item.id

describe('mergeByUpdatedAt', () => {
  test('keeps items that exist on only one side', () => {
    const local = [{ id: 'a', v: 'L', createdAt: T2, updatedAt: T2 }]
    const remote = [{ id: 'b', v: 'R', createdAt: T1, updatedAt: T1 }]
    assert.deepEqual(mergeByUpdatedAt<Item>(local, remote, keyOf).map((i) => i.id), ['a', 'b'])
  })

  test('the newer updatedAt wins, in both directions', () => {
    const local = [
      { id: 'a', v: 'local-newer', createdAt: T1, updatedAt: T3 },
      { id: 'b', v: 'local-older', createdAt: T1, updatedAt: T1 },
    ]
    const remote = [
      { id: 'a', v: 'remote-older', createdAt: T1, updatedAt: T2 },
      { id: 'b', v: 'remote-newer', createdAt: T1, updatedAt: T2 },
    ]
    const byId = Object.fromEntries(mergeByUpdatedAt<Item>(local, remote, keyOf).map((i) => [i.id, i.v]))
    assert.deepEqual(byId, { a: 'local-newer', b: 'remote-newer' })
  })

  test('ties keep the local copy', () => {
    const merged = mergeByUpdatedAt<Item>([{ id: 'a', v: 'L', updatedAt: T1 }], [{ id: 'a', v: 'R', updatedAt: T1 }], keyOf)
    assert.equal(merged[0].v, 'L')
  })

  test('a missing updatedAt loses to any timestamp', () => {
    const merged = mergeByUpdatedAt<Item>([{ id: 'a', v: 'legacy' }], [{ id: 'a', v: 'R', updatedAt: T1 }], keyOf)
    assert.equal(merged[0].v, 'R')
  })

  test('sorts newest-created first, undated last', () => {
    const local = [{ id: 'old', v: '', createdAt: T1 }, { id: 'undated', v: '' }]
    const remote = [{ id: 'new', v: '', createdAt: T3 }]
    assert.deepEqual(mergeByUpdatedAt<Item>(local, remote, keyOf).map((i) => i.id), ['new', 'old', 'undated'])
  })
})

describe('tombstones', () => {
  test('mergeDeletions keeps tombstones from both sides, and the latest time per item', () => {
    const local = [
      { entityType: 'prompt', entityId: 'a', deletedAt: T1 },
      { entityType: 'skill', entityId: 'b', deletedAt: T3 },
    ]
    const remote = [
      { entityType: 'prompt', entityId: 'a', deletedAt: T2 },
      { entityType: 'skill', entityId: 'b', deletedAt: T1 },
      { entityType: 'taste', entityId: 'c', deletedAt: T1 },
    ]
    const byKey = Object.fromEntries(mergeDeletions(local, remote).map((d) => [`${d.entityType}:${d.entityId}`, d.deletedAt]))
    assert.deepEqual(byKey, { 'prompt:a': T2, 'skill:b': T3, 'taste:c': T1 })
  })

  test('an item is deleted if its last edit is at or before the delete, and kept if edited after', () => {
    const isDeleted = makeIsDeleted([{ entityType: 'prompt', entityId: 'a', deletedAt: T2 }])
    assert.equal(isDeleted('prompt', 'a', T1), true)
    assert.equal(isDeleted('prompt', 'a', T2), true)
    assert.equal(isDeleted('prompt', 'a', T3), false)
    assert.equal(isDeleted('prompt', 'a'), true, 'no updatedAt counts as deleted')
  })

  test('other ids, and other types with the same id, are unaffected', () => {
    const isDeleted = makeIsDeleted([{ entityType: 'prompt', entityId: 'a', deletedAt: T2 }])
    assert.equal(isDeleted('prompt', 'b', T1), false)
    assert.equal(isDeleted('workflow', 'a', T1), false)
  })
})
