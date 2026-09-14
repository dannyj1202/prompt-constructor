/** Every whitespace-separated query term must appear in at least one field. */
export function matchesQuery(fields: Array<string | undefined>, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const text = fields.join('\n').toLowerCase()
  return terms.every((term) => text.includes(term))
}

/** Query + tag filter for anything with tags. */
export function filterTagged<T extends { tags: string[] }>(
  items: T[],
  { query, tag }: { query: string; tag: string | null },
  fields: (item: T) => Array<string | undefined>,
): T[] {
  return items.filter(
    (item) => (!tag || item.tags.includes(tag)) && matchesQuery([...fields(item), ...item.tags], query),
  )
}

/** Tags with their usage counts, most used first. */
export function countByTag(items: { tags: string[] }[]): [tag: string, count: number][] {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b))
}

/** `"#Design System "` → `"design-system"` */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
