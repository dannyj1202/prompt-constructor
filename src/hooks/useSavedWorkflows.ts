import { useCallback, useSyncExternalStore } from 'react'
import { apiCreateWorkflow, apiUpdateWorkflow } from '../lib/api'
import { recordDeletion } from '../lib/deletions'
import { createId } from '../lib/id'
import { getSavedWorkflows, setSavedWorkflows, subscribeSavedWorkflows } from '../lib/savedWorkflowsStorage'
import type { UserWorkflowInput, Workflow } from '../types/workflow'

export function useSavedWorkflows() {
  const workflows = useSyncExternalStore(subscribeSavedWorkflows, getSavedWorkflows)

  const create = useCallback((input: UserWorkflowInput): Workflow => {
    const now = new Date().toISOString()
    const workflow: Workflow = {
      ...input,
      id: `user-workflow/${createId()}`,
      origin: 'user',
      createdAt: now,
      updatedAt: now,
    }
    setSavedWorkflows([workflow, ...getSavedWorkflows()])
    apiCreateWorkflow(workflow).catch((err) => console.warn('[API] Create workflow failed, saved locally:', err))
    return workflow
  }, [])

  const update = useCallback((id: string, input: UserWorkflowInput): Workflow | undefined => {
    const current = getSavedWorkflows().find((wf) => wf.id === id)
    if (!current) return undefined
    const updated: Workflow = { ...current, ...input, updatedAt: new Date().toISOString() }
    setSavedWorkflows(getSavedWorkflows().map((wf) => (wf.id === id ? updated : wf)))
    apiUpdateWorkflow(id, updated).catch((err) => console.warn('[API] Update workflow failed, saved locally:', err))
    return updated
  }, [])

  const remove = useCallback((id: string) => {
    setSavedWorkflows(getSavedWorkflows().filter((wf) => wf.id !== id))
    recordDeletion('workflow', id)
  }, [])

  return { workflows, create, update, remove }
}
