import { useCallback, useSyncExternalStore } from 'react'
import { apiCreatePrompt, apiUpdatePrompt } from '../lib/api'
import { recordDeletion } from '../lib/deletions'
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
    apiCreatePrompt(prompt).catch((err) => console.warn('[API] Create prompt failed, saved locally:', err))
    return prompt
  }, [])

  const update = useCallback((id: string, input: UserPromptInput): UserPrompt | undefined => {
    const current = getSavedPrompts().find((prompt) => prompt.id === id)
    if (!current) return undefined
    const updated: UserPrompt = { ...current, ...input, updatedAt: new Date().toISOString() }
    setSavedPrompts(getSavedPrompts().map((prompt) => (prompt.id === id ? updated : prompt)))
    apiUpdatePrompt(id, updated).catch((err) => console.warn('[API] Update prompt failed, saved locally:', err))
    return updated
  }, [])

  const remove = useCallback((id: string) => {
    setSavedPrompts(getSavedPrompts().filter((prompt) => prompt.id !== id))
    recordDeletion('prompt', id)
  }, [])

  return { prompts, create, update, remove }
}
