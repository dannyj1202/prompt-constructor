import { WORKFLOWS } from '../../data/workflows'
import { href, navigate, type Route } from '../../lib/router'
import { matchesQuery } from '../../lib/search'
import type { Prompt } from '../../types/prompt'
import { BrowseLayout } from '../layout/browse-layout'
import { PageHeading } from '../layout/page-heading'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { ContentCard } from '../ui/content-card'

const PREVIEW_STEPS = 4

interface WorkflowsPageProps {
  route: Route
  /** Built-in and saved prompts, for resolving step titles. */
  promptsById: Map<string, Prompt>
}

export function WorkflowsPage({ route, promptsById }: WorkflowsPageProps) {
  const query = route.params.get('q') ?? ''
  const stepTitle = (promptId: string) => promptsById.get(promptId)?.title ?? promptId

  const visible = WORKFLOWS.filter((workflow) =>
    matchesQuery(
      [workflow.title, workflow.description, ...workflow.steps.map((step) => stepTitle(step.promptId))],
      query,
    ),
  )
  const clearFilters = () => navigate(href(route.path), { replace: true })

  return (
    <BrowseLayout
      heading={
        <PageHeading
          title="Workflows"
          description="Ordered chains of prompts for multi-step tasks. Open one to copy each step in turn."
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
                <span className="text-indigo-600 dark:text-indigo-400">
                  {workflow.steps.length} {workflow.steps.length === 1 ? 'step' : 'steps'}
                </span>
              }
              onOpen={() => navigate(href(`/workflows/${workflow.id}`))}
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
  )
}
