import { useMemo, useState } from 'react'
import { WORKFLOWS } from '../../data/workflows'
import { useEntityHistory } from '../../hooks/useEntityHistory'
import { useSavedWorkflows } from '../../hooks/useSavedWorkflows'
import { href, navigate, type Route } from '../../lib/router'
import { matchesQuery } from '../../lib/search'
import type { EntityHistoryRecord } from '../../types/history'
import type { Prompt } from '../../types/prompt'
import type { UserWorkflowInput, Workflow } from '../../types/workflow'
import { EntityHistoryDialog } from '../history/entity-history-dialog'
import { HistoryBadge } from '../history/history-badge'
import { BrowseLayout } from '../layout/browse-layout'
import { PageHeading } from '../layout/page-heading'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { ContentCard } from '../ui/content-card'
import { ClockIcon, PencilIcon, PlusIcon, TrashIcon } from '../ui/icons'
import { WorkflowFormDialog } from './workflow-form-dialog'

const PREVIEW_STEPS = 4

interface WorkflowsPageProps {
  route: Route
  /** Built-in and saved prompts, for resolving step titles. */
  promptsById: Map<string, Prompt>
}

export function WorkflowsPage({ route, promptsById }: WorkflowsPageProps) {
  const { workflows: userWorkflows, create, update, remove } = useSavedWorkflows()
  const { getHistory, saveEdit, revertToVersion, histories } = useEntityHistory()
  const [formWorkflow, setFormWorkflow] = useState<{ workflow?: Workflow } | null>(null)
  const [historyRecord, setHistoryRecord] = useState<EntityHistoryRecord | null>(null)

  // Overlay any customized snapshot onto workflows
  const allWorkflows = useMemo(() => {
    const workflowHistories = new Map(
      histories.filter((h) => h.entityType === 'workflow').map((h) => [h.entityId, h]),
    )
    return [...userWorkflows, ...WORKFLOWS].map((w) => {
      const h = workflowHistories.get(w.id)
      return h ? { ...w, ...(h.currentSnapshot as Partial<Workflow>) } : w
    })
  }, [userWorkflows, histories])

  const query = route.params.get('q') ?? ''
  const stepTitle = (promptId: string) => promptsById.get(promptId)?.title ?? promptId

  const availablePrompts = useMemo(() => Array.from(promptsById.values()), [promptsById])

  const visible = allWorkflows.filter((workflow) =>
    matchesQuery(
      [workflow.title, workflow.description, ...workflow.steps.map((step) => stepTitle(step.promptId))],
      query,
    ),
  )
  const clearFilters = () => navigate(href(route.path), { replace: true })

  function handleSubmit(input: UserWorkflowInput) {
    if (formWorkflow?.workflow) {
      const target = formWorkflow.workflow
      if (target.origin === 'user') {
        update(target.id, input)
      }
      saveEdit('workflow', target.id, input.title, target, { ...target, ...input }, 'Saved workflow modifications')
    } else {
      create(input)
    }
    setFormWorkflow(null)
  }

  function handleRevert(versionNumber: number) {
    if (!historyRecord) return
    const updated = revertToVersion<Workflow>('workflow', historyRecord.entityId, versionNumber)
    if (updated) {
      setHistoryRecord(updated)
      // If it was a user workflow, also update savedWorkflows store
      const snap = updated.currentSnapshot
      if (userWorkflows.some((w) => w.id === updated.entityId)) {
        update(updated.entityId, {
          title: snap.title,
          description: snap.description,
          steps: snap.steps,
          tags: snap.tags,
        })
      }
    }
  }

  return (
    <>
      <BrowseLayout
        heading={
          <PageHeading
            title="Workflows"
            description="Ordered chains of prompts for multi-step developer tasks. Open one to copy each step in turn, customize built-in flows, or build your own."
            actions={
              <Button variant="primary" onClick={() => setFormWorkflow({})}>
                <PlusIcon className="size-4" />
                Create Workflow
              </Button>
            }
          />
        }
        count={visible.length}
        noun={['workflow', 'workflows']}
        hasFilters={Boolean(query)}
        onClearFilters={clearFilters}
      >
        {visible.length > 0 ? (
          <CardGrid
            items={visible}
            getKey={(workflow) => workflow.id}
            renderItem={(workflow) => {
              const history = getHistory('workflow', workflow.id)
              return (
                <ContentCard
                  title={workflow.title}
                  description={workflow.description}
                  eyebrow={
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {workflow.steps.length} {workflow.steps.length === 1 ? 'step' : 'steps'}
                      </span>
                      {workflow.origin === 'user' && (
                        <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                          Custom
                        </span>
                      )}
                      {history && history.currentVersionNumber > 0 && (
                        <HistoryBadge
                          versionNumber={history.currentVersionNumber}
                          totalRevisions={history.revisions.length}
                          onClick={() => setHistoryRecord(history)}
                        />
                      )}
                    </div>
                  }
                  onOpen={() => navigate(href(`/workflows/${workflow.id}`))}
                  footer={
                    <div className="flex items-center gap-1">
                      {history && history.currentVersionNumber > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setHistoryRecord(history)}
                          title="View revision history"
                          className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                        >
                          <ClockIcon className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormWorkflow({ workflow })}
                        aria-label={`Edit ${workflow.title}`}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      {workflow.origin === 'user' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(workflow.id)}
                          aria-label={`Delete ${workflow.title}`}
                          className="hover:text-red-600 dark:hover:text-red-400"
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  }
                >
                  <ol className="mt-3 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {workflow.steps.slice(0, PREVIEW_STEPS).map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="w-4 shrink-0 text-right text-xs leading-5 text-zinc-400 tabular-nums">
                          {index + 1}.
                        </span>
                        <span className="truncate">{stepTitle(step.promptId)}</span>
                      </li>
                    ))}
                    {workflow.steps.length > PREVIEW_STEPS && (
                      <li className="pl-6 text-xs text-zinc-400">+{workflow.steps.length - PREVIEW_STEPS} more</li>
                    )}
                  </ol>
                </ContentCard>
              )
            }}
          />
        ) : (
          <EmptyState
            title="No workflows match your search."
            action={<Button onClick={clearFilters}>Clear search</Button>}
          />
        )}
      </BrowseLayout>

      {formWorkflow && (
        <WorkflowFormDialog
          workflow={formWorkflow.workflow}
          availablePrompts={availablePrompts}
          onSubmit={handleSubmit}
          onClose={() => setFormWorkflow(null)}
        />
      )}

      {historyRecord && (
        <EntityHistoryDialog
          record={historyRecord}
          onRevert={handleRevert}
          onClose={() => setHistoryRecord(null)}
        />
      )}
    </>
  )
}
