import { useId, useState, type FormEvent, type ReactNode } from 'react'
import type { Skill, UserSkillInput } from '../../types/skill'
import { Button } from '../ui/button'
import { Modal, ModalFooter, ModalHeader } from '../ui/modal'
import { TagInput } from '../ui/tag-input'

interface SkillFormDialogProps {
  skill?: Skill
  tagSuggestions?: string[]
  onSubmit: (input: UserSkillInput) => void
  onClose: () => void
}

const DEFAULT_SKILL_BODY = `---
name: my-skill-name
description: A clear description of what this skill does and when the agent should use it.
---
# My Skill

## Instructions
Describe step-by-step instructions for the AI coding agent.

## Rules & Constraints
- Be explicit about conventions, imports, and error handling.
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

export function SkillFormDialog({ skill, tagSuggestions = [], onSubmit, onClose }: SkillFormDialogProps) {
  const titleId = useId()
  const fieldId = useId()
  const [name, setName] = useState(skill?.name ?? '')
  const [title, setTitle] = useState(skill?.title ?? '')
  const [description, setDescription] = useState(skill?.description ?? '')
  const [tags, setTags] = useState<string[]>(skill?.tags ?? ['skill'])
  const [source, setSource] = useState(skill?.source ?? '')
  const [body, setBody] = useState(skill?.body ?? DEFAULT_SKILL_BODY)
  const [attempted, setAttempted] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const titleMissing = attempted && !title.trim()
  const nameMissing = attempted && !name.trim()
  const bodyMissing = attempted && !body.trim()

  function handleNameChange(raw: string) {
    const slug = raw.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    setName(slug)
    if (!source || source.startsWith('.cursor/skills/')) {
      setSource(`.cursor/skills/${slug}/SKILL.md`)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    if (!title.trim() || !name.trim() || !body.trim()) return

    try {
      onSubmit({
        name: name.trim(),
        title: title.trim(),
        description: description.trim(),
        tags,
        source: source.trim() || `.cursor/skills/${name.trim()}/SKILL.md`,
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
          title={skill ? 'Edit Skill' : 'Create Agent Skill'}
          description="Agent Skills are multi-file prompts with YAML frontmatter used by Claude, Cursor, Windsurf, and other coding assistants."
          onClose={onClose}
        />

        <div className="space-y-4 overflow-y-auto p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor={`${fieldId}-title`} error={titleMissing ? 'Add a title.' : undefined}>
              <input
                id={`${fieldId}-title`}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (!name) handleNameChange(e.target.value)
                }}
                placeholder="e.g. Test ID Standards"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </Field>

            <Field label="Skill Folder Name" htmlFor={`${fieldId}-name`} hint="kebab-case" error={nameMissing ? 'Add a folder name.' : undefined}>
              <input
                id={`${fieldId}-name`}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. testid-standards"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </Field>
          </div>

          <Field label="Description" htmlFor={`${fieldId}-desc`} hint="Tells the agent when to use this skill">
            <input
              id={`${fieldId}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Standard data-testid naming conventions for components"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Target Path" htmlFor={`${fieldId}-source`} hint="Where it lives in the repo">
            <input
              id={`${fieldId}-source`}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder=".cursor/skills/my-skill/SKILL.md"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-xs outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </Field>

          <Field label="Tags" htmlFor={`${fieldId}-tags`} hint="Press enter or comma">
            <TagInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
          </Field>

          <Field label="SKILL.md Content" htmlFor={`${fieldId}-body`} hint="Markdown with YAML frontmatter" error={bodyMissing ? 'Add skill markdown.' : undefined}>
            <textarea
              id={`${fieldId}-body`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
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
            {skill ? 'Save changes' : 'Create Skill'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
