import { WORKFLOWS } from '../../data/workflows'
import { href } from '../../lib/router'
import type { Prompt } from '../../types/prompt'
import { PageHeading } from '../layout/page-heading'
import { EmptyState } from '../ui/card-grid'
import { ArrowLeftIcon } from '../ui/icons'
import { WorkflowStepItem } from './workflow-step-item'

interface WorkflowDetailPageProps {
  workflowId: string
  promptsById: Map<string, Prompt>
}

export function WorkflowDetailPage({ workflowId, promptsById }: WorkflowDetailPageProps) {
  const workflow = WORKFLOWS.find((w) => w.id === workflowId)

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
            description={`${workflow.description} ${workflow.steps.length} ${workflow.steps.length === 1 ? 'step' : 'steps'}.`}
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
    </div>
  )
}
