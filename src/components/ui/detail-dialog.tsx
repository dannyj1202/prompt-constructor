import { useId, type ReactNode } from 'react'
import { Modal, ModalFooter, ModalHeader } from './modal'
import { TagList } from './tag-list'

interface DetailDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  eyebrow?: ReactNode
  /** Shown in full as a monospace block, unless `bodyContent` overrides it. */
  body: string
  /** Replaces the default `<pre>{body}</pre>`, e.g. a live variable-filled preview. */
  bodyContent?: ReactNode
  /** Rendered between the header and the body, e.g. a variable-input panel. */
  beforeBody?: ReactNode
  tags?: string[]
  activeTag?: string | null
  onTagClick?: (tag: string) => void
  source?: string
  /** Footer controls, e.g. copy/edit/delete. */
  actions: ReactNode
}

/** Full-content view shared by prompts, skills, and taste entries. */
export function DetailDialog({
  open,
  onClose,
  title,
  description,
  eyebrow,
  body,
  bodyContent,
  beforeBody,
  tags = [],
  activeTag = null,
  onTagClick,
  source,
  actions,
}: DetailDialogProps) {
  const titleId = useId()

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <ModalHeader titleId={titleId} title={title} eyebrow={eyebrow} description={description} onClose={onClose} />

      {beforeBody}

      <div className="overflow-y-auto p-5">
        {bodyContent ?? (
          <pre className="rounded-lg bg-zinc-50 p-4 font-mono text-sm whitespace-pre-wrap text-zinc-800 dark:bg-canvas-inset dark:text-zinc-200">
            {body}
          </pre>
        )}
      </div>

      <ModalFooter>
        <div className="min-w-0 space-y-2">
          {onTagClick && <TagList tags={tags} activeTag={activeTag} onTagClick={onTagClick} />}
          {source && (
            <p className="text-xs text-zinc-500">
              Source: <code className="font-mono">{source}</code>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </ModalFooter>
    </Modal>
  )
}
