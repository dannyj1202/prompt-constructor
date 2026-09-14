import { CATEGORY_BY_ID } from '../../data/categories'
import type { Prompt } from '../../types/prompt'
import { CopyButton } from './copy-button'
import { TagList } from './tag-list'

interface PromptCardProps {
  prompt: Prompt
  activeTag: string | null
  onOpen: (prompt: Prompt) => void
  onTagClick: (tag: string) => void
}

export function PromptCard({ prompt, activeTag, onOpen, onTagClick }: PromptCardProps) {
  return (
    <article className="relative flex w-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            {CATEGORY_BY_ID[prompt.category].name}
          </p>
          <h3 className="mt-0.5 leading-snug font-semibold">
            {/* Stretched button: the whole card opens the detail view, while the
                copy and tag buttons sit above it on z-10. */}
            <button
              type="button"
              onClick={() => onOpen(prompt)}
              className="text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-indigo-500"
            >
              {prompt.title}
            </button>
          </h3>
        </div>
        <CopyButton text={prompt.body} className="relative z-10 shrink-0" />
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{prompt.description}</p>

      <pre className="mt-3 line-clamp-5 rounded-lg bg-zinc-50 p-3 font-mono text-xs whitespace-pre-wrap text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        {prompt.body}
      </pre>

      <div className="mt-auto space-y-2 pt-3">
        <TagList
          tags={prompt.tags}
          activeTag={activeTag}
          onTagClick={onTagClick}
          className="relative z-10"
        />
        {prompt.source && (
          <p className="truncate text-xs text-zinc-500" title={prompt.source}>
            Source: <code className="font-mono">{prompt.source}</code>
          </p>
        )}
      </div>
    </article>
  )
}
