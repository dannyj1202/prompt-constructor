import type { CategoryId, Prompt } from '../types/prompt'
import { filterTagged } from './search'

export interface PromptFilters {
  query: string
  category: CategoryId | null
  tag: string | null
}

export function filterPrompts(prompts: Prompt[], { query, category, tag }: PromptFilters): Prompt[] {
  const inCategory = category ? prompts.filter((prompt) => prompt.category === category) : prompts
  return filterTagged(inCategory, { query, tag }, (prompt) => [
    prompt.title,
    prompt.description,
    prompt.body,
    prompt.source,
  ])
}

export function countByCategory(prompts: Prompt[]): Map<CategoryId, number> {
  const counts = new Map<CategoryId, number>()
  for (const prompt of prompts) {
    if (prompt.category) counts.set(prompt.category, (counts.get(prompt.category) ?? 0) + 1)
  }
  return counts
}
