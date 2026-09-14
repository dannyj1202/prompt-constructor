import type { Prompt, UserPrompt } from '../../types/prompt'

/** Handlers the app shell passes to every view that renders prompt cards. */
export interface PromptActions {
  onOpen: (prompt: Prompt) => void
  onEdit: (prompt: UserPrompt) => void
  onDelete: (prompt: UserPrompt) => void
}
