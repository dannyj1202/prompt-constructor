import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { apiStarPrompt, apiUnstarPrompt } from '../lib/api'
import { getStarredPromptIds, setStarredPromptIds, subscribeStarredPrompts } from '../lib/starredPromptsStorage'

export function useStarredPrompts() {
  const ids = useSyncExternalStore(subscribeStarredPrompts, getStarredPromptIds)
  const starredSet = useMemo(() => new Set(ids), [ids])

  const isStarred = useCallback((id: string) => starredSet.has(id), [starredSet])

  const toggleStar = useCallback((id: string) => {
    const current = getStarredPromptIds()
    if (current.includes(id)) {
      setStarredPromptIds(current.filter((x) => x !== id))
      apiUnstarPrompt(id).catch((err) => console.warn('[API] Unstar failed, updated locally:', err))
    } else {
      setStarredPromptIds([...current, id])
      apiStarPrompt(id).catch((err) => console.warn('[API] Star failed, updated locally:', err))
    }
  }, [])

  return { starredIds: starredSet, isStarred, toggleStar, count: starredSet.size }
}
