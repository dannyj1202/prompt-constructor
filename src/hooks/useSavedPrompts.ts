import { useCallback, useSyncExternalStore } from 'react'
import { createId } from '../lib/id'
import { getSavedPrompts, setSavedPrompts, subscribeSavedPrompts } from '../lib/savedPromptsStorage'
import type { UserPrompt, UserPromptInput } from '../types/prompt'

export function useSavedPrompts() {
  const prompts = useSyncExternalStore(subscribeSavedPrompts, getSavedPrompts)

  const create = useCallback((input: UserPromptInput): UserPrompt => {
    const now = new Date().toISOString()
    const prompt: UserPrompt = { ...input, id: `saved/${createId()}`, origin: 'user', createdAt: now, updatedAt: now }
    // Newest first
    setSavedPrompts([prompt, ...getSavedPrompts()])
    return prompt
  }, [])

  const update = useCallback((id: string, input: UserPromptInput): UserPrompt | undefined => {
    let updated: UserPrompt | undefined
    setSavedPrompts(
      getSavedPrompts().map((prompt) => {
        if (prompt.id !== id) return prompt
        updated = { ...prompt, ...input, updatedAt: new Date().toISOString() }
        return updated
      }),
    )
    return updated
  }, [])

  const remove = useCallback((id: string) => {
    setSavedPrompts(getSavedPrompts().filter((prompt) => prompt.id !== id))
  }, [])

  return { prompts, create, update, remove }
}
