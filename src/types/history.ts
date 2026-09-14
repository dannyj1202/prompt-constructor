export type EntityType = 'prompt' | 'workflow' | 'taste' | 'skill'

export interface EntityRevision<T = unknown> {
  revisionId: string
  versionNumber: number // 0 = Original baseline, 1 = Edit 1, 2 = Edit 2...
  timestamp: string // ISO date string
  label: string // e.g. "Original baseline", "Edit 1", "Edit 2", "Reverted to Edit 1"
  summary?: string
  snapshot: T // Complete snapshot data of the entity at this revision
}

export interface EntityHistoryRecord<T = unknown> {
  entityId: string
  entityType: EntityType
  title: string
  originalSnapshot: T // Version 0 snapshot
  currentSnapshot: T // Currently active snapshot
  currentVersionNumber: number
  revisions: EntityRevision<T>[] // Ordered list of revisions [Rev 0, Rev 1, ...]
  createdAt: string
  updatedAt: string
}

export interface RecentlyEditedItem {
  entityId: string
  entityType: EntityType
  title: string
  description?: string
  currentVersionNumber: number
  totalRevisions: number
  lastEditedAt: string
  tags?: string[]
}
