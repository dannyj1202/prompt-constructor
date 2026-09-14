import { useId, useState } from 'react'
import { cn } from '../../lib/cn'
import type { Prompt } from '../../types/prompt'
import type { WorkflowStep } from '../../types/workflow'
import { PromptEyebrow } from '../prompts/prompt-eyebrow'
import { CopyButton } from '../ui/copy-button'
import { ChevronDownIcon } from '../ui/icons'

interface WorkflowStepItemProps {
  number: number
  step: WorkflowStep
  /** Undefined when the referenced prompt no longer exists. */
  prompt: Prompt | undefined
  defaultExpanded?: boolean
}

export function WorkflowStepItem({ number, step, prompt, defaultExpanded = false }: WorkflowStepItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const bodyId = useId()

  return (
    <li className="flex gap-3">
      <span className="mt-3 grid size-7 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white tabular-nums">
        {number}
      </span>

      <div className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {prompt ? (
          <>
            <div className="flex items-start justify-between gap-3 p-4">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                aria-controls={bodyId}
                className="group flex min-w-0 flex-1 items-start gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <ChevronDownIcon
                  className={cn('mt-0.5 size-4 shrink-0 text-zinc-400 transition-transform', !expanded && '-rotate-90')}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                    <PromptEyebrow prompt={prompt} />
                  </span>
                  <span className="mt-0.5 block leading-snug font-semibold group-hover:underline">
                    {prompt.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">{prompt.description}</span>
                </span>
              </button>
              <CopyButton text={prompt.body} className="shrink-0" />
            </div>

            {step.note && (
              <p className="mx-4 mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                {step.note}
              </p>
            )}

            <div id={bodyId} hidden={!expanded} className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              <pre className="rounded-lg bg-zinc-50 p-3 font-mono text-xs whitespace-pre-wrap text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
                {prompt.body}
              </pre>
            </div>
          </>
        ) : (
          <div className="p-4 text-sm text-red-700 dark:text-red-400">
            Prompt <code className="font-mono">{step.promptId}</code> not found. It may have been renamed or deleted.
          </div>
        )}
      </div>
    </li>
  )
}
