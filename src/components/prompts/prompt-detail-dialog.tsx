import { useEffect, useRef } from 'react'
import { CATEGORY_BY_ID } from '../../data/categories'
import type { Prompt } from '../../types/prompt'
import { XIcon } from '../ui/icons'
import { CopyButton } from './copy-button'
import { TagList } from './tag-list'

interface PromptDetailDialogProps {
  prompt: Prompt | null
  activeTag: string | null
  onClose: () => void
  onTagClick: (tag: string) => void
}

export function PromptDetailDialog({ prompt, activeTag, onClose, onTagClick }: PromptDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (prompt && !dialog.open) dialog.showModal()
    if (!prompt && dialog.open) dialog.close()
  }, [prompt])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // The content fills the dialog, so a click whose target is the dialog
      // itself landed on the backdrop.
      onClick={(event) => event.target === event.currentTarget && onClose()}
      className="m-auto w-[min(48rem,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
    >
      {prompt && (
        <div className="flex max-h-[85vh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800">
            <div className="min-w-0">
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {CATEGORY_BY_ID[prompt.category].name}
              </p>
              <h2 className="mt-0.5 text-lg font-semibold">{prompt.title}</h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{prompt.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <XIcon className="size-5" />
            </button>
          </header>

          <div className="overflow-y-auto p-5">
            <pre className="rounded-lg bg-zinc-50 p-4 font-mono text-sm whitespace-pre-wrap text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {prompt.body}
            </pre>
          </div>

          <footer className="flex flex-wrap items-end justify-between gap-3 border-t border-zinc-200 p-5 dark:border-zinc-800">
            <div className="min-w-0 space-y-2">
              <TagList tags={prompt.tags} activeTag={activeTag} onTagClick={onTagClick} />
              {prompt.source && (
                <p className="text-xs text-zinc-500">
                  Source: <code className="font-mono">{prompt.source}</code>
                </p>
              )}
            </div>
            <CopyButton text={prompt.body} label="Copy prompt" className="px-3 py-1.5 text-sm" />
          </footer>
        </div>
      )}
    </dialog>
  )
}
