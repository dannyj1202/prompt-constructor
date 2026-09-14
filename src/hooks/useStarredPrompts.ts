import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { getStarredPromptIds, setStarredPromptIds, subscribeStarredPrompts } from '../lib/starredPromptsStorage'

export function useStarredPrompts() {
  const ids = useSyncExternalStore(subscribeStarredPrompts, getStarredPromptIds)
  const starredSet = useMemo(() => new Set(ids), [ids])

  const isStarred = useCallback((id: string) => starredSet.has(id), [starredSet])

  const toggleStar = useCallback((id: string) => {
    const current = getStarredPromptIds()
    if (current.includes(id)) {
      setStarredPromptIds(current.filter((x) => x !== id))
    } else {
      setStarredPromptIds([...current, id])
    }
  }, [])

  return { starredIds: starredSet, isStarred, toggleStar, count: starredSet.size }
}
