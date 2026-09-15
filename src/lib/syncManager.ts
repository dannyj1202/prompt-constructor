import {
  apiGetDeletions,
  apiGetFavorites,
  apiGetHistories,
  apiGetPrompts,
  apiGetSkills,
  apiGetTaste,
  apiGetWorkflows,
  apiSyncLocalStorage,
} from './api'
import { getDeletions, setDeletions } from './deletions'
import { getAllEntityHistories, setAllEntityHistories } from './entityHistoryStorage'
import { makeIsDeleted, mergeByUpdatedAt, mergeDeletions } from './merge'
import { getSavedPrompts, setSavedPrompts } from './savedPromptsStorage'
import { getSavedSkills, setSavedSkills } from './savedSkillsStorage'
import { getSavedTaste, setSavedTaste } from './savedTasteStorage'
import { getSavedWorkflows, setSavedWorkflows } from './savedWorkflowsStorage'
import { getStarredPromptIds, setStarredPromptIds } from './starredPromptsStorage'

/**
 * Two-way sync, run once on startup. Pulls everything from the API, merges it
 * with localStorage (see mergeByUpdatedAt), drops anything either side deleted
 * after its last edit (see deletions.ts), saves the result locally, then pushes
 * it back so the API picks up changes made while it was unreachable. If the
 * API is down, localStorage is left untouched.
 */
export async function initializeBackendSync(): Promise<void> {
  try {
    const [prompts, workflows, skills, taste, favorites, histories, remoteDeletions] = await Promise.all([
      apiGetPrompts(),
      apiGetWorkflows(),
      apiGetSkills(),
      apiGetTaste(),
      apiGetFavorites(),
      apiGetHistories(),
      apiGetDeletions(),
    ])

    // Read local state only now, and don't await again until the merge is
    // written back, so nothing saved while the fetch was in flight is lost.
    const deletions = mergeDeletions(getDeletions(), remoteDeletions)
    const isDeleted = makeIsDeleted(deletions)
    const mergedPrompts = mergeByUpdatedAt(getSavedPrompts(), prompts, (p) => p.id).filter(
      (p) => !isDeleted('prompt', p.id, p.updatedAt),
    )
    const promptIds = new Set(mergedPrompts.map((p) => p.id))
    const merged = {
      prompts: mergedPrompts,
      workflows: mergeByUpdatedAt(getSavedWorkflows(), workflows, (w) => w.id).filter(
        (w) => !isDeleted('workflow', w.id, w.updatedAt),
      ),
      skills: mergeByUpdatedAt(getSavedSkills(), skills, (s) => s.name).filter(
        (s) => !isDeleted('skill', s.name, s.updatedAt),
      ),
      taste: mergeByUpdatedAt(getSavedTaste(), taste, (t) => t.id).filter((t) => !isDeleted('taste', t.id, t.updatedAt)),
      // A deleted prompt's star goes with it, unless the prompt was re-created.
      favorites: [...new Set([...getStarredPromptIds(), ...favorites])].filter(
        (id) => promptIds.has(id) || !isDeleted('prompt', id),
      ),
      history: mergeByUpdatedAt(getAllEntityHistories(), histories, (h) => `${h.entityType}:${h.entityId}`).filter(
        (h) => !isDeleted(h.entityType, h.entityId, h.updatedAt),
      ),
      deletions,
    }
    setSavedPrompts(merged.prompts)
    setSavedWorkflows(merged.workflows)
    setSavedSkills(merged.skills)
    setSavedTaste(merged.taste)
    setStarredPromptIds(merged.favorites)
    setAllEntityHistories(merged.history)
    setDeletions(merged.deletions)

    await apiSyncLocalStorage(merged)
  } catch (err) {
    console.warn('[BackendSync] Sync with the API failed; running on localStorage only.', err)
  }
}
