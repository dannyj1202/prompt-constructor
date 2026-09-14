import { useId, useState, type FormEvent, type ReactNode } from 'react'
import type { Prompt } from '../../types/prompt'
import type { UserWorkflowInput, Workflow, WorkflowStep } from '../../types/workflow'
import { Button } from '../ui/button'
import { Modal, ModalFooter, ModalHeader } from '../ui/modal'
import { TagInput } from '../ui/tag-input'
import { PlusIcon, TrashIcon } from '../ui/icons'

interface WorkflowFormDialogProps {
  workflow?: Workflow
  availablePrompts: Prompt[]
  tagSuggestions?: string[]
  onSubmit: (input: UserWorkflowInput) => void
  onClose: () => void
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="block text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
            {label}
          </label>
        ) : (
          <span className="block text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
            {label}
          </span>
        )}
        {hint && <span className="text-xs text-zinc-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export function WorkflowFormDialog({
  workflow,
  availablePrompts,
  tagSuggestions = [],
  onSubmit,
  onClose,
}: WorkflowFormDialogProps) {
  const titleId = useId()
  const fieldId = useId()
  const [title, setTitle] = useState(workflow?.title ?? '')
  const [description, setDescription] = useState(workflow?.description ?? '')
  const [tags, setTags] = useState<string[]>(workflow?.tags ?? ['workflow'])
  const [steps, setSteps] = useState<WorkflowStep[]>(
    workflow?.steps.length
      ? workflow.steps
      : [{ promptId: availablePrompts[0]?.id ?? '', note: '' }],
  )
  const [attempted, setAttempted] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const titleMissing = attempted && !title.trim()
  const stepsMissing = attempted && steps.filter((s) => s.promptId).length === 0

  function addStep() {
    setSteps((prev) => [...prev, { promptId: availablePrompts[0]?.id ?? '', note: '' }])
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index))
  }

  function moveStep(from: number, to: number) {
    if (to < 0 || to >= steps.length) return
    setSteps((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  function updateStep(index: number, patch: Partial<WorkflowStep>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    const validSteps = steps.filter((s) => s.promptId.trim())
    if (!title.trim() || validSteps.length === 0) return

    try {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        tags,
        steps: validSteps,
      })
    } catch {
      setSaveError("Couldn't save: this browser's storage is full or unavailable.")
    }
  }

  return (
    <Modal open onClose={onClose} labelledBy={titleId} closeOnBackdrop={false}>
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <ModalHeader
          titleId={titleId}
          title={workflow ? 'Edit Workflow' : 'Create Custom Workflow'}
          description="Workflows are ordered chains of prompts for multi-step developer tasks. Build and execute your own sequences."
          onClose={onClose}
        />

        <div className="space-y-5 overflow-y-auto p-5">
          <Field label="Workflow Title" htmlFor={`${fieldId}-title`} error={titleMissing ? 'Add a title.' : undefined}>
            <input
              id={`${fieldId}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production Hotfix Pipeline"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Description" htmlFor={`${fieldId}-desc`}>
            <input
              id={`${fieldId}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Investigate root cause, write a patch test, open a hotfix PR"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Tags" hint="Press enter or comma">
            <TagInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
          </Field>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
                Workflow Steps ({steps.length})
              </span>
              <Button size="sm" onClick={addStep}>
                <PlusIcon className="size-3.5" />
                Add Step
              </Button>
            </div>

            {stepsMissing && <p className="text-xs text-red-600 dark:text-red-400">At least one step with a prompt is required.</p>}

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-white/8 dark:bg-canvas-inset"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid size-5 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        {index + 1}
                      </span>
                      <span className="text-xs font-medium text-zinc-500">Step {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveStep(index, index - 1)}
                        className="rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-200 disabled:opacity-30 dark:hover:bg-zinc-800"
                        title="Move step up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index === steps.length - 1}
                        onClick={() => moveStep(index, index + 1)}
                        className="rounded px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-200 disabled:opacity-30 dark:hover:bg-zinc-800"
                        title="Move step down"
                      >
                        ↓
                      </button>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="rounded p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Remove step"
                        >
                          <TrashIcon className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-zinc-500">Prompt</label>
                      <select
                        value={step.promptId}
                        onChange={(e) => updateStep(index, { promptId: e.target.value })}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        {availablePrompts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} {p.origin === 'user' ? '(Saved)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-zinc-500">Step Guidance / Context (Optional)</label>
                      <input
                        value={step.note ?? ''}
                        onChange={(e) => updateStep(index, { note: e.target.value })}
                        placeholder="e.g. Check logs in Sentry first, or provide ticket ID"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {saveError && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">{saveError}</p>}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {workflow ? 'Save changes' : 'Create Workflow'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
