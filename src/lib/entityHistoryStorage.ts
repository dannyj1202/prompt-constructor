import type { EntityHistoryRecord, EntityRevision, EntityType, RecentlyEditedItem } from '../types/history'

export const ENTITY_HISTORY_STORAGE_KEY = 'prompt-constructor:entity-history:v1'

type HistoryStore = Record<string, EntityHistoryRecord>

function makeKey(type: EntityType, id: string): string {
  return `${type}:${id}`
}

function read(): HistoryStore {
  try {
    const raw = localStorage.getItem(ENTITY_HISTORY_STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as HistoryStore
    }
    return {}
  } catch {
    return {}
  }
}

let cache: HistoryStore | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function onStorage(event: StorageEvent) {
  if (event.key !== ENTITY_HISTORY_STORAGE_KEY) return
  cache = read()
  emit()
}

function write(store: HistoryStore): void {
  localStorage.setItem(ENTITY_HISTORY_STORAGE_KEY, JSON.stringify(store))
  cache = store
  emit()
}

export function getAllEntityHistories(): EntityHistoryRecord[] {
  cache ??= read()
  return Object.values(cache)
}

export function getEntityHistory<T = unknown>(
  type: EntityType,
  id: string,
): EntityHistoryRecord<T> | null {
  cache ??= read()
  const key = makeKey(type, id)
  const record = cache[key]
  return record ? (record as unknown as EntityHistoryRecord<T>) : null
}

export function recordEntityEdit<T = unknown>(
  type: EntityType,
  id: string,
  title: string,
  originalSnapshot: T,
  newSnapshot: T,
  summary?: string,
): EntityHistoryRecord<T> {
  cache ??= read()
  const now = new Date().toISOString()
  const key = makeKey(type, id)
  const existing = cache[key] as EntityHistoryRecord<T> | undefined

  let updatedRecord: EntityHistoryRecord<T>

  if (!existing) {
    const rev0: EntityRevision<T> = {
      revisionId: `rev-0-${Date.now()}`,
      versionNumber: 0,
      timestamp: now,
      label: 'Original baseline',
      summary: 'Initial unedited state',
      snapshot: originalSnapshot,
    }

    const rev1: EntityRevision<T> = {
      revisionId: `rev-1-${Date.now()}`,
      versionNumber: 1,
      timestamp: now,
      label: 'Edit 1',
      summary: summary ?? 'First customized revision',
      snapshot: newSnapshot,
    }

    updatedRecord = {
      entityId: id,
      entityType: type,
      title,
      originalSnapshot,
      currentSnapshot: newSnapshot,
      currentVersionNumber: 1,
      revisions: [rev0, rev1],
      createdAt: now,
      updatedAt: now,
    }
  } else {
    const nextVersion = existing.revisions.length
    const nextRev: EntityRevision<T> = {
      revisionId: `rev-${nextVersion}-${Date.now()}`,
      versionNumber: nextVersion,
      timestamp: now,
      label: `Edit ${nextVersion}`,
      summary: summary ?? `Revision ${nextVersion}`,
      snapshot: newSnapshot,
    }

    updatedRecord = {
      ...existing,
      title,
      currentSnapshot: newSnapshot,
      currentVersionNumber: nextVersion,
      revisions: [...existing.revisions, nextRev],
      updatedAt: now,
    }
  }

  const nextStore: HistoryStore = {
    ...cache,
    [key]: updatedRecord as unknown as EntityHistoryRecord,
  }
  write(nextStore)
  return updatedRecord
}

export function revertEntityToVersion<T = unknown>(
  type: EntityType,
  id: string,
  targetVersionNumber: number,
): EntityHistoryRecord<T> | null {
  cache ??= read()
  const key = makeKey(type, id)
  const existing = cache[key] as EntityHistoryRecord<T> | undefined
  if (!existing) return null

  const targetRev = existing.revisions.find((r) => r.versionNumber === targetVersionNumber)
  if (!targetRev) return null

  const now = new Date().toISOString()
  const newVersionNumber = existing.revisions.length
  const revertRev: EntityRevision<T> = {
    revisionId: `rev-${newVersionNumber}-${Date.now()}`,
    versionNumber: newVersionNumber,
    timestamp: now,
    label: `Reverted to ${targetRev.label}`,
    summary: `Restored snapshot from version ${targetVersionNumber}`,
    snapshot: targetRev.snapshot,
  }

  const updatedRecord: EntityHistoryRecord<T> = {
    ...existing,
    currentSnapshot: targetRev.snapshot,
    currentVersionNumber: targetVersionNumber,
    revisions: [...existing.revisions, revertRev],
    updatedAt: now,
  }

  const nextStore: HistoryStore = {
    ...cache,
    [key]: updatedRecord as unknown as EntityHistoryRecord,
  }
  write(nextStore)
  return updatedRecord
}

export function revertEntityToOriginal<T = unknown>(
  type: EntityType,
  id: string,
): EntityHistoryRecord<T> | null {
  return revertEntityToVersion<T>(type, id, 0)
}

export function deleteEntityHistory(type: EntityType, id: string): void {
  cache ??= read()
  const key = makeKey(type, id)
  if (!(key in cache)) return
  const nextStore = { ...cache }
  delete nextStore[key]
  write(nextStore)
}

export function getRecentlyEditedItems(): RecentlyEditedItem[] {
  cache ??= read()
  return Object.values(cache)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map((record) => {
      const snap = record.currentSnapshot as { description?: string; tags?: string[] } | undefined
      return {
        entityId: record.entityId,
        entityType: record.entityType,
        title: record.title,
        description: snap?.description,
        currentVersionNumber: record.currentVersionNumber,
        totalRevisions: record.revisions.length,
        lastEditedAt: record.updatedAt,
        tags: snap?.tags,
      }
    })
}

export function subscribeEntityHistory(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}
