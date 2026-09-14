import { useMemo, useState } from 'react'
import { WORKFLOWS } from '../../data/workflows'
import { useSavedWorkflows } from '../../hooks/useSavedWorkflows'
import { href, navigate, type Route } from '../../lib/router'
import { matchesQuery } from '../../lib/search'
import type { Prompt } from '../../types/prompt'
import type { UserWorkflowInput, Workflow } from '../../types/workflow'
import { BrowseLayout } from '../layout/browse-layout'
import { PageHeading } from '../layout/page-heading'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { ContentCard } from '../ui/content-card'
import { PencilIcon, PlusIcon, TrashIcon } from '../ui/icons'
import { WorkflowFormDialog } from './workflow-form-dialog'

const PREVIEW_STEPS = 4

interface WorkflowsPageProps {
  route: Route
  /** Built-in and saved prompts, for resolving step titles. */
  promptsById: Map<string, Prompt>
}

export function WorkflowsPage({ route, promptsById }: WorkflowsPageProps) {
  const { workflows: userWorkflows, create, update, remove } = useSavedWorkflows()
  const [formWorkflow, setFormWorkflow] = useState<{ workflow?: Workflow } | null>(null)

  const allWorkflows = useMemo(() => [...userWorkflows, ...WORKFLOWS], [userWorkflows])
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
      update(formWorkflow.workflow.id, input)
    } else {
      create(input)
    }
    setFormWorkflow(null)
  }

  return (
    <>
      <BrowseLayout
        heading={
          <PageHeading
            title="Workflows"
            description="Ordered chains of prompts for multi-step developer tasks. Open one to copy each step in turn, or create your own."
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
            renderItem={(workflow) => (
              <ContentCard
                title={workflow.title}
                description={workflow.description}
                eyebrow={
                  <div className="flex items-center gap-1.5">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {workflow.steps.length} {workflow.steps.length === 1 ? 'step' : 'steps'}
                    </span>
                    {workflow.origin === 'user' && (
                      <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                        Custom
                      </span>
                    )}
                  </div>
                }
                onOpen={() => navigate(href(`/workflows/${workflow.id}`))}
                footer={
                  workflow.origin === 'user' && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormWorkflow({ workflow })}
                        aria-label={`Edit ${workflow.title}`}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(workflow.id)}
                        aria-label={`Delete ${workflow.title}`}
                        className="hover:text-red-600 dark:hover:text-red-400"
                      >
                        <TrashIcon className="size-3.5" />
                      </Button>
                    </div>
                  )
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
            )}
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
    </>
  )
}
