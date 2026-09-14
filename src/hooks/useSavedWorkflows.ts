import { useCallback, useSyncExternalStore } from 'react'
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
    return workflow
  }, [])

  const update = useCallback((id: string, input: UserWorkflowInput): Workflow | undefined => {
    let updated: Workflow | undefined
    setSavedWorkflows(
      getSavedWorkflows().map((wf) => {
        if (wf.id !== id) return wf
        updated = { ...wf, ...input, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const remove = useCallback((id: string) => {
    setSavedWorkflows(getSavedWorkflows().filter((wf) => wf.id !== id))
  }, [])

  return { workflows, create, update, remove }
}
