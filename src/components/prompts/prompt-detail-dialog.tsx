import type { Prompt } from '../../types/prompt'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'
import type { PromptActions } from './prompt-actions'
import { SavedPromptControls } from './prompt-card'
import { PromptEyebrow } from './prompt-eyebrow'

interface PromptDetailDialogProps extends Pick<PromptActions, 'onEdit' | 'onDelete'> {
  prompt: Prompt
  activeTag: string | null
  onClose: () => void
  onTagClick: (tag: string) => void
}

/** Mount only while a prompt is open. */
export function PromptDetailDialog({
  prompt,
  activeTag,
  onClose,
  onTagClick,
  onEdit,
  onDelete,
}: PromptDetailDialogProps) {
  return (
    <DetailDialog
      open
      onClose={onClose}
      title={prompt.title}
      description={prompt.description}
      eyebrow={<PromptEyebrow prompt={prompt} />}
      body={prompt.body}
      tags={prompt.tags}
      activeTag={activeTag}
      onTagClick={onTagClick}
      source={prompt.source}
      actions={
        <>
          {prompt.origin === 'user' && (
            <SavedPromptControls prompt={prompt} onEdit={onEdit} onDelete={onDelete} labelled />
          )}
          <CopyButton text={prompt.body} label="Copy prompt" className="px-3 py-1.5 text-sm" />
        </>
      }
    />
  )
}
