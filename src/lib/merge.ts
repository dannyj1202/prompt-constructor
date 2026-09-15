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
