import { useSyncExternalStore } from 'react'
import type { EntityHistoryRecord, EntityType } from '../types/history'
export type { RecentlyEditedItem } from '../types/history'
import {
  deleteEntityHistory,
  getAllEntityHistories,
  getEntityHistory,
  getRecentlyEditedItems,
  recordEntityEdit,
  revertEntityToOriginal,
  revertEntityToVersion,
  subscribeEntityHistory,
} from '../lib/entityHistoryStorage'

export function useEntityHistory() {
  const histories = useSyncExternalStore(subscribeEntityHistory, getAllEntityHistories, () => [])
  const recentlyEdited = useSyncExternalStore(subscribeEntityHistory, getRecentlyEditedItems, () => [])

  return {
    histories,
    recentlyEdited,
    getHistory: <T = unknown>(type: EntityType, id: string): EntityHistoryRecord<T> | null =>
      getEntityHistory<T>(type, id),
    saveEdit: <T = unknown>(
      type: EntityType,
      id: string,
      title: string,
      originalSnapshot: T,
      newSnapshot: T,
      summary?: string,
    ): EntityHistoryRecord<T> =>
      recordEntityEdit<T>(type, id, title, originalSnapshot, newSnapshot, summary),
    revertToVersion: <T = unknown>(
      type: EntityType,
      id: string,
      versionNumber: number,
    ): EntityHistoryRecord<T> | null =>
      revertEntityToVersion<T>(type, id, versionNumber),
    revertToOriginal: <T = unknown>(
      type: EntityType,
      id: string,
    ): EntityHistoryRecord<T> | null =>
      revertEntityToOriginal<T>(type, id),
    deleteHistory: (type: EntityType, id: string): void =>
      deleteEntityHistory(type, id),
  }
}
