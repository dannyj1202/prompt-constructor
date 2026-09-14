import { templateVariables } from '../../lib/formatContent'
import type { Prompt, UserPrompt } from '../../types/prompt'
import { Button } from '../ui/button'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { StarButton } from '../ui/star-button'
import { PencilIcon, TrashIcon } from '../ui/icons'
import type { PromptActions } from './prompt-actions'
import { PromptEyebrow } from './prompt-eyebrow'

interface PromptCardProps extends PromptActions {
  prompt: Prompt
  activeTag: string | null
  onTagClick: (tag: string) => void
  /** Keyboard grid navigation's current pick. */
  highlighted?: boolean
  isStarred?: boolean
  onToggleStar?: () => void
}

export function PromptCard({
  prompt,
  activeTag,
  onTagClick,
  highlighted,
  isStarred = false,
  onToggleStar,
  onOpen,
  onEdit,
  onDelete,
}: PromptCardProps) {
  const variables = templateVariables(prompt.body)

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
      highlighted={highlighted}
      actions={
        <div className="flex items-center gap-1.5">
          {onToggleStar && <StarButton isStarred={isStarred} onToggle={onToggleStar} />}
          <CopyButton text={prompt.body} />
        </div>
      }
      footer={
        prompt.origin === 'user' && <SavedPromptControls prompt={prompt} onEdit={onEdit} onDelete={onDelete} />
      }
    >
      {variables.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {variables.map((name) => (
            <li
              key={name}
              className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              [{name}]
            </li>
          ))}
        </ul>
      )}
    </ContentCard>
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
