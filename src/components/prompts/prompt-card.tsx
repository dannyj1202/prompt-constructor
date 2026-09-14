import { useMemo } from 'react'
import { templateVariables } from '../../lib/formatContent'
import type { Prompt, UserPrompt } from '../../types/prompt'
import { HistoryBadge } from '../history/history-badge'
import { Button } from '../ui/button'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { PencilIcon, TrashIcon } from '../ui/icons'
import { StarButton } from '../ui/star-button'
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
  versionNumber?: number
  totalRevisions?: number
}

export function PromptCard({
  prompt,
  activeTag,
  onTagClick,
  highlighted,
  isStarred = false,
  onToggleStar,
  versionNumber,
  totalRevisions,
  onOpen,
  onEdit,
  onDelete,
  onHistory,
}: PromptCardProps) {
  const variables = useMemo(() => templateVariables(prompt.body), [prompt.body])

  return (
    <ContentCard
      title={prompt.title}
      description={prompt.description}
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <PromptEyebrow prompt={prompt} />
          {versionNumber !== undefined && versionNumber > 0 && (
            <HistoryBadge
              versionNumber={versionNumber}
              totalRevisions={totalRevisions}
              onClick={onHistory ? () => onHistory(prompt) : undefined}
            />
          )}
        </div>
      }
      preview={prompt.body}
      tags={prompt.tags}
      activeTag={activeTag}
      onTagClick={onTagClick}
      source={prompt.source}
      onOpen={() => onOpen(prompt)}
      highlighted={highlighted}
      actions={
        <div className="flex items-center gap-1.5">
          {onToggleStar && (
            <StarButton
              isStarred={isStarred}
              onToggle={onToggleStar}
              ariaLabel={isStarred ? `Remove ${prompt.title} from favorites` : `Add ${prompt.title} to favorites`}
            />
          )}
          <CopyButton text={prompt.body} />
        </div>
      }
      footer={
        <PromptControls
          prompt={prompt}
          onEdit={onEdit}
          onDelete={prompt.origin === 'user' ? onDelete : undefined}
          onHistory={onHistory}
          versionNumber={versionNumber}
          totalRevisions={totalRevisions}
        />
      }
    >
      {variables.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {variables.map((name) => (
            <li
              key={name}
              className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono text-xs font-medium text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              [{name}]
            </li>
          ))}
        </ul>
      )}
    </ContentCard>
  )
}

interface PromptControlsProps {
  prompt: Prompt
  onEdit: (prompt: Prompt) => void
  onDelete?: (prompt: UserPrompt) => void
  onHistory?: (prompt: Prompt) => void
  versionNumber?: number
  totalRevisions?: number
  /** Icon-only on cards, labelled in the detail dialog. */
  labelled?: boolean
}

export function PromptControls({
  prompt,
  onEdit,
  onDelete,
  onHistory,
  versionNumber,
  totalRevisions,
  labelled = false,
}: PromptControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {versionNumber !== undefined && versionNumber > 0 && onHistory && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onHistory(prompt)}
          aria-label={labelled ? undefined : `View history for ${prompt.title}`}
          title="View edit history"
          className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
        >
          <span className="font-mono text-xs">v{versionNumber}</span>
          {labelled && `History (${totalRevisions ?? versionNumber})`}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(prompt)}
        aria-label={labelled ? undefined : `Edit ${prompt.title}`}
      >
        <PencilIcon className="size-3.5" />
        {labelled && 'Edit'}
      </Button>
      {onDelete && prompt.origin === 'user' && (
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
      )}
    </div>
  )
}

/** Legacy alias */
export const SavedPromptControls = PromptControls
