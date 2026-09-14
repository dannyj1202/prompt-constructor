import { useMemo, useState } from 'react'
import { WORKFLOWS } from '../../data/workflows'
import { useEntityHistory } from '../../hooks/useEntityHistory'
import { useSavedWorkflows } from '../../hooks/useSavedWorkflows'
import { href } from '../../lib/router'
import type { EntityHistoryRecord } from '../../types/history'
import type { Prompt } from '../../types/prompt'
import type { UserWorkflowInput, Workflow } from '../../types/workflow'
import { EntityHistoryDialog } from '../history/entity-history-dialog'
import { HistoryBadge } from '../history/history-badge'
import { PageHeading } from '../layout/page-heading'
import { Button } from '../ui/button'
import { EmptyState } from '../ui/card-grid'
import { ArrowLeftIcon, ClockIcon, PencilIcon } from '../ui/icons'
import { WorkflowFormDialog } from './workflow-form-dialog'
import { WorkflowStepItem } from './workflow-step-item'

interface WorkflowDetailPageProps {
  workflowId: string
  promptsById: Map<string, Prompt>
}

export function WorkflowDetailPage({ workflowId, promptsById }: WorkflowDetailPageProps) {
  const { workflows: userWorkflows, update } = useSavedWorkflows()
  const { getHistory, saveEdit, revertToVersion } = useEntityHistory()
  const [editing, setEditing] = useState(false)
  const [historyRecord, setHistoryRecord] = useState<EntityHistoryRecord | null>(null)

  const history = getHistory<Workflow>('workflow', workflowId)
  const baseWorkflow = [...userWorkflows, ...WORKFLOWS].find((w) => w.id === workflowId)

  const workflow = useMemo(() => {
    if (!baseWorkflow) return undefined
    return history ? { ...baseWorkflow, ...history.currentSnapshot } : baseWorkflow
  }, [baseWorkflow, history])

  const availablePrompts = useMemo(() => Array.from(promptsById.values()), [promptsById])

  function handleSubmit(input: UserWorkflowInput) {
    if (!workflow) return
    if (workflow.origin === 'user') {
      update(workflow.id, input)
    }
    saveEdit('workflow', workflow.id, input.title, workflow, { ...workflow, ...input }, 'Saved workflow modifications')
    setEditing(false)
  }

  function handleRevert(versionNumber: number) {
    const updated = revertToVersion<Workflow>('workflow', workflowId, versionNumber)
    if (updated) {
      setHistoryRecord(updated)
      const snap = updated.currentSnapshot
      if (userWorkflows.some((w) => w.id === workflowId)) {
        update(workflowId, {
          title: snap.title,
          description: snap.description,
          steps: snap.steps,
          tags: snap.tags,
        })
      }
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <a
        href={href('/workflows')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ArrowLeftIcon className="size-4" />
        All workflows
      </a>

      {workflow ? (
        <>
          <PageHeading
            title={workflow.title}
            description={
              <div className="flex flex-wrap items-center gap-2">
                <span>{`${workflow.description} ${workflow.steps.length} ${workflow.steps.length === 1 ? 'step' : 'steps'}.`}</span>
                {history && history.currentVersionNumber > 0 && (
                  <HistoryBadge
                    versionNumber={history.currentVersionNumber}
                    totalRevisions={history.revisions.length}
                    onClick={() => setHistoryRecord(history)}
                  />
                )}
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                {history && history.currentVersionNumber > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => setHistoryRecord(history)}
                    title="View revision history"
                    className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                  >
                    <ClockIcon className="size-4" />
                    History ({history.revisions.length})
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  <PencilIcon className="size-4" />
                  Edit Workflow
                </Button>
              </div>
            }
          />
          <ol className="space-y-3">
            {workflow.steps.map((step, index) => (
              <WorkflowStepItem
                key={index}
                number={index + 1}
                step={step}
                prompt={promptsById.get(step.promptId)}
                defaultExpanded={index === 0}
              />
            ))}
          </ol>
        </>
      ) : (
        <EmptyState title="Workflow not found" description={`No workflow has the id "${workflowId}".`} />
      )}

      {editing && workflow && (
        <WorkflowFormDialog
          workflow={workflow}
          availablePrompts={availablePrompts}
          onSubmit={handleSubmit}
          onClose={() => setEditing(false)}
        />
      )}

      {historyRecord && (
        <EntityHistoryDialog
          record={historyRecord}
          onRevert={handleRevert}
          onClose={() => setHistoryRecord(null)}
        />
      )}
    </div>
  )
}
