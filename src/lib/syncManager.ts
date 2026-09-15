import {
  apiGetFavorites,
  apiGetHistories,
  apiGetPrompts,
  apiGetSkills,
  apiGetTaste,
  apiGetWorkflows,
  apiSyncLocalStorage,
} from './api'
import { getAllEntityHistories, setAllEntityHistories } from './entityHistoryStorage'
import { mergeByUpdatedAt } from './merge'
import { getSavedPrompts, setSavedPrompts } from './savedPromptsStorage'
import { getSavedSkills, setSavedSkills } from './savedSkillsStorage'
import { getSavedTaste, setSavedTaste } from './savedTasteStorage'
import { getSavedWorkflows, setSavedWorkflows } from './savedWorkflowsStorage'
import { getStarredPromptIds, setStarredPromptIds } from './starredPromptsStorage'

/**
 * Two-way sync, run once on startup. Pulls everything from the API, merges it
 * with localStorage (see mergeByUpdatedAt), saves the result locally, then
 * pushes it back so the API picks up anything created or edited while it was
 * unreachable. If the API is down, localStorage is left untouched.
 *
 * Deletions aren't tracked: an item deleted while the other side was out of
 * reach comes back on the next merge.
 */
export async function initializeBackendSync(): Promise<void> {
  try {
    const [prompts, workflows, skills, taste, favorites, histories] = await Promise.all([
      apiGetPrompts(),
      apiGetWorkflows(),
      apiGetSkills(),
      apiGetTaste(),
      apiGetFavorites(),
      apiGetHistories(),
    ])

    // Read local state only now, and don't await again until the merge is
    // written back, so nothing saved while the fetch was in flight is lost.
    const merged = {
      prompts: mergeByUpdatedAt(getSavedPrompts(), prompts, (p) => p.id),
      workflows: mergeByUpdatedAt(getSavedWorkflows(), workflows, (w) => w.id),
      skills: mergeByUpdatedAt(getSavedSkills(), skills, (s) => s.name),
      taste: mergeByUpdatedAt(getSavedTaste(), taste, (t) => t.id),
      favorites: [...new Set([...getStarredPromptIds(), ...favorites])],
      history: mergeByUpdatedAt(getAllEntityHistories(), histories, (h) => `${h.entityType}:${h.entityId}`),
    }
    setSavedPrompts(merged.prompts)
    setSavedWorkflows(merged.workflows)
    setSavedSkills(merged.skills)
    setSavedTaste(merged.taste)
    setStarredPromptIds(merged.favorites)
    setAllEntityHistories(merged.history)

    await apiSyncLocalStorage(merged)
  } catch (err) {
    console.warn('[BackendSync] Sync with the API failed; running on localStorage only.', err)
  }
}
