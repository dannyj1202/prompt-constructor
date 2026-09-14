import { CATEGORY_BY_ID } from '../../data/categories'
import type { Prompt } from '../../types/prompt'

export function SavedBadge() {
  return (
    <span className="rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-semibold tracking-wide text-amber-800 uppercase dark:bg-amber-950 dark:text-amber-300">
      Saved
    </span>
  )
}

/** "Saved" badge (for user prompts) and category name, shown above a prompt's title. */
export function PromptEyebrow({ prompt }: { prompt: Prompt }) {
  return (
    <>
      {prompt.origin === 'user' && <SavedBadge />}
      {prompt.category && (
        <span className="text-indigo-600 dark:text-indigo-400">{CATEGORY_BY_ID[prompt.category].name}</span>
      )}
    </>
  )
}
