import type { Prompt } from '../../types/prompt'
import { PromptCard } from './prompt-card'

interface PromptGridProps {
  prompts: Prompt[]
  activeTag: string | null
  onOpen: (prompt: Prompt) => void
  onTagClick: (tag: string) => void
  onClearFilters: () => void
}

export function PromptGrid({ prompts, activeTag, onOpen, onTagClick, onClearFilters }: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center dark:border-zinc-700">
        <p className="font-medium">No prompts match your filters.</p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Clear filters
        </button>
      </div>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {prompts.map((prompt) => (
        <li key={prompt.id} className="flex">
          <PromptCard prompt={prompt} activeTag={activeTag} onOpen={onOpen} onTagClick={onTagClick} />
        </li>
      ))}
    </ul>
  )
}
