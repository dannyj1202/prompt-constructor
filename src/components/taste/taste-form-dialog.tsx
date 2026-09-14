import { useId, useState, type FormEvent, type ReactNode } from 'react'
import type { TasteEntry, UserTasteInput } from '../../types/taste'
import { Button } from '../ui/button'
import { Modal, ModalFooter, ModalHeader } from '../ui/modal'
import { TagInput } from '../ui/tag-input'

interface TasteFormDialogProps {
  entry?: TasteEntry
  tagSuggestions?: string[]
  onSubmit: (input: UserTasteInput) => void
  onClose: () => void
}

const DEFAULT_TASTE_BODY = `### Conventions & Style

- **Patterns:** State explicit rules (e.g. functional components, discriminated unions).
- **Tooling:** Specify preferred libraries, helpers, and syntax standards.
- **Do not:** Call out anti-patterns or banned practices.
`

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
          {label}
        </label>
        {hint && <span className="text-xs text-zinc-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

export function TasteFormDialog({ entry, tagSuggestions = [], onSubmit, onClose }: TasteFormDialogProps) {
  const titleId = useId()
  const fieldId = useId()
  const [title, setTitle] = useState(entry?.title ?? '')
  const [description, setDescription] = useState(entry?.description ?? '')
  const [tags, setTags] = useState<string[]>(entry?.tags ?? ['taste', 'conventions'])
  const [source, setSource] = useState(entry?.source ?? '')
  const [body, setBody] = useState(entry?.body ?? DEFAULT_TASTE_BODY)
  const [attempted, setAttempted] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const titleMissing = attempted && !title.trim()
  const bodyMissing = attempted && !body.trim()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    if (!title.trim() || !body.trim()) return

    try {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        tags,
        source: source.trim() || 'Custom Taste',
        body: body.trim(),
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
          title={entry ? 'Edit Taste' : 'Create Coding Taste'}
          description="Tastes are single markdown files that define your coding conventions and style preferences for AI agents."
          onClose={onClose}
        />

        <div className="space-y-4 overflow-y-auto p-5">
          <Field label="Title" htmlFor={`${fieldId}-title`} error={titleMissing ? 'Add a title.' : undefined}>
            <input
              id={`${fieldId}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TypeScript Strict Guidelines"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Description" htmlFor={`${fieldId}-desc`}>
            <input
              id={`${fieldId}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Rules for strict type assertions and discriminated unions"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Source Citation" htmlFor={`${fieldId}-source`} hint="e.g. AGENTS.md - Style or personal notes">
            <input
              id={`${fieldId}-source`}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="AGENTS.md - Code Style"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-xs outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Tags" htmlFor={`${fieldId}-tags`} hint="Press enter or comma">
            <TagInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
          </Field>

          <Field label="Markdown Conventions" htmlFor={`${fieldId}-body`} error={bodyMissing ? 'Add conventions content.' : undefined}>
            <textarea
              id={`${fieldId}-body`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 font-mono text-xs leading-relaxed outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-canvas-inset"
            />
          </Field>

          {saveError && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">{saveError}</p>}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {entry ? 'Save changes' : 'Create Taste'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
