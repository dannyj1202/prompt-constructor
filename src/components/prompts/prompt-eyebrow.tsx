import { CATEGORY_ACCENT_TEXT, CATEGORY_BY_ID } from '../../data/categories'
import type { Prompt } from '../../types/prompt'

export function SavedBadge() {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold tracking-wide text-amber-800 uppercase dark:bg-amber-950 dark:text-amber-300">
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
        <span className={CATEGORY_ACCENT_TEXT[CATEGORY_BY_ID[prompt.category].accent]}>
          {CATEGORY_BY_ID[prompt.category].name}
        </span>
      )}
    </>
  )
}
