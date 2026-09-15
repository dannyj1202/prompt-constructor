// Pure, with no imports, so it can be tested under plain Node.

interface Timestamped {
  createdAt?: string
  updatedAt?: string
}

function newestFirst(a: Timestamped, b: Timestamped): number {
  const x = a.createdAt ?? ''
  const y = b.createdAt ?? ''
  if (x === y) return 0
  return x < y ? 1 : -1
}

/**
 * Merges the local and remote copies of a collection by key. Items on only one
 * side are kept. When both sides have an item, the later `updatedAt` wins; ties
 * keep the local copy. Returns newest-created first, the order the stores use.
 */
export function mergeByUpdatedAt<T extends Timestamped>(local: T[], remote: T[], keyOf: (item: T) => string): T[] {
  const merged = new Map(local.map((item) => [keyOf(item), item]))
  for (const item of remote) {
    const existing = merged.get(keyOf(item))
    if (!existing || (item.updatedAt ?? '') > (existing.updatedAt ?? '')) merged.set(keyOf(item), item)
  }
  return [...merged.values()].sort(newestFirst)
}

interface Tombstone {
  entityType: string
  entityId: string
  deletedAt: string
}

/** Merges two tombstone lists, keeping the latest delete time per item. */
export function mergeDeletions<T extends Tombstone>(local: T[], remote: T[]): T[] {
  const merged = new Map<string, T>()
  for (const deletion of [...local, ...remote]) {
    const key = `${deletion.entityType}:${deletion.entityId}`
    const existing = merged.get(key)
    if (!existing || deletion.deletedAt > existing.deletedAt) merged.set(key, deletion)
  }
  return [...merged.values()]
}

/**
 * Builds a check for whether an item was deleted at or after its last edit.
 * An item edited after its delete counts as re-created and is kept; one with
 * no `updatedAt` counts as deleted if any tombstone exists.
 */
export function makeIsDeleted(deletions: Tombstone[]): (entityType: string, entityId: string, updatedAt?: string) => boolean {
  const deletedAt = new Map(deletions.map((d) => [`${d.entityType}:${d.entityId}`, d.deletedAt]))
  return (entityType, entityId, updatedAt) => {
    const time = deletedAt.get(`${entityType}:${entityId}`)
    return time !== undefined && (updatedAt ?? '') <= time
  }
}
