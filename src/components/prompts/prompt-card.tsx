import type { Prompt, UserPrompt } from '../../types/prompt'
import { Button } from '../ui/button'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { PencilIcon, TrashIcon } from '../ui/icons'
import type { PromptActions } from './prompt-actions'
import { PromptEyebrow } from './prompt-eyebrow'

interface PromptCardProps extends PromptActions {
  prompt: Prompt
  activeTag: string | null
  onTagClick: (tag: string) => void
}

export function PromptCard({ prompt, activeTag, onTagClick, onOpen, onEdit, onDelete }: PromptCardProps) {
  return (
    <ContentCard
      title={prompt.title}
      description={prompt.description}
      eyebrow={<PromptEyebrow prompt={prompt} />}
      preview={prompt.body}
      tags={prompt.tags}
      activeTag={activeTag}
      onTagClick={onTagClick}
      source={prompt.source}
      onOpen={() => onOpen(prompt)}
      actions={<CopyButton text={prompt.body} />}
      footer={
        prompt.origin === 'user' && <SavedPromptControls prompt={prompt} onEdit={onEdit} onDelete={onDelete} />
      }
    />
  )
}

interface SavedPromptControlsProps extends Pick<PromptActions, 'onEdit' | 'onDelete'> {
  prompt: UserPrompt
  /** Icon-only on cards, labelled in the detail dialog. */
  labelled?: boolean
}

export function SavedPromptControls({ prompt, onEdit, onDelete, labelled = false }: SavedPromptControlsProps) {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(prompt)}
        aria-label={labelled ? undefined : `Edit ${prompt.title}`}
      >
        <PencilIcon className="size-3.5" />
        {labelled && 'Edit'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(prompt)}
        aria-label={labelled ? undefined : `Delete ${prompt.title}`}
        className="hover:text-red-600 dark:hover:text-red-400"
      >
        <TrashIcon className="size-3.5" />
        {labelled && 'Delete'}
      </Button>
    </>
  )
}
