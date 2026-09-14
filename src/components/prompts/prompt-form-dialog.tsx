import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { CATEGORIES, isCategoryId } from '../../data/categories'
import type { CategoryId, UserPrompt, UserPromptInput } from '../../types/prompt'
import { Button } from '../ui/button'
import { Modal, ModalFooter, ModalHeader } from '../ui/modal'
import { TagInput } from '../ui/tag-input'

interface PromptFormDialogProps {
  /** Omit to create a new prompt. */
  prompt?: UserPrompt
  tagSuggestions: string[]
  /** May throw (e.g. localStorage full); the form shows the error. */
  onSubmit: (input: UserPromptInput) => void
  onClose: () => void
}

export const INPUT_CLASS =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950'

/** Create/Edit Prompt form. Mount only while open so fields start from `prompt`. */
export function PromptFormDialog({ prompt, tagSuggestions, onSubmit, onClose }: PromptFormDialogProps) {
  const titleId = useId()
  const fieldId = useId()
  const [title, setTitle] = useState(prompt?.title ?? '')
  const [description, setDescription] = useState(prompt?.description ?? '')
  const [category, setCategory] = useState<CategoryId | ''>(prompt?.category ?? '')
  const [tags, setTags] = useState<string[]>(prompt?.tags ?? [])
  const [body, setBody] = useState(prompt?.body ?? '')
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
        category: category || undefined,
        tags,
        body: body.trim(),
      })
    } catch {
      setSaveError("Couldn't save: this browser's storage is full or unavailable.")
    }
  }

  return (
    <Modal open onClose={onClose} labelledBy={titleId} closeOnBackdrop={false}>
      <form
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) event.currentTarget.requestSubmit()
        }}
        noValidate
        className="flex min-h-0 flex-1 flex-col"
      >
        <ModalHeader
          titleId={titleId}
          title={prompt ? 'Edit prompt' : 'Create prompt'}
          description="Saved in this browser and shown alongside the built-in prompts."
          onClose={onClose}
        />

        <div className="space-y-4 overflow-y-auto p-5">
          <Field label="Title" htmlFor={`${fieldId}-title`} error={titleMissing ? 'Add a title.' : undefined}>
            <input
              id={`${fieldId}-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              data-autofocus
              aria-invalid={titleMissing}
              placeholder="e.g. Review a PR for i18n issues"
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Description" htmlFor={`${fieldId}-description`} optional>
            <input
              id={`${fieldId}-description`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={240}
              placeholder="One line on what this prompt is for"
              className={INPUT_CLASS}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Labels"
              htmlFor={`${fieldId}-labels`}
              optional
              hint="Press Enter or comma to add."
            >
              <TagInput
                id={`${fieldId}-labels`}
                value={tags}
                onChange={setTags}
                suggestions={tagSuggestions}
              />
            </Field>
            <Field label="Category" htmlFor={`${fieldId}-category`} optional>
              <select
                id={`${fieldId}-category`}
                value={category}
                onChange={(event) => setCategory(isCategoryId(event.target.value) ? event.target.value : '')}
                className={`${INPUT_CLASS} h-10`}
              >
                <option value="">None</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Prompt"
            htmlFor={`${fieldId}-body`}
            hint="Use {{VARIABLE}} for parts you fill in each time."
            error={bodyMissing ? 'Add the prompt text.' : undefined}
          >
            <textarea
              id={`${fieldId}-body`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={10}
              aria-invalid={bodyMissing}
              className={`${INPUT_CLASS} resize-y font-mono`}
            />
          </Field>
        </div>

        <ModalFooter className="items-center">
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            {saveError}
          </p>
          <div className="flex items-center gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary">
              {prompt ? 'Save changes' : 'Save prompt'}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  )
}

interface FieldProps {
  label: string
  htmlFor: string
  optional?: boolean
  hint?: string
  error?: string
  children: ReactNode
}

function Field({ label, htmlFor, optional, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-zinc-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : (
        hint && <p className="text-xs text-zinc-500">{hint}</p>
      )}
    </div>
  )
}
