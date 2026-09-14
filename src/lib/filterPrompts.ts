import type { CategoryId, Prompt } from '../types/prompt'

export interface PromptFilters {
  query: string
  category: CategoryId | null
  tag: string | null
}

function searchableText(prompt: Prompt): string {
  return [prompt.title, prompt.description, prompt.body, prompt.source ?? '', ...prompt.tags]
    .join('\n')
    .toLowerCase()
}

/** Every whitespace-separated search term must appear somewhere in the prompt. */
export function filterPrompts(prompts: Prompt[], { query, category, tag }: PromptFilters): Prompt[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)

  return prompts.filter((prompt) => {
    if (category && prompt.category !== category) return false
    if (tag && !prompt.tags.includes(tag)) return false
    if (terms.length === 0) return true
    const text = searchableText(prompt)
    return terms.every((term) => text.includes(term))
  })
}

export function countByCategory(prompts: Prompt[]): Map<CategoryId, number> {
  const counts = new Map<CategoryId, number>()
  for (const prompt of prompts) {
    counts.set(prompt.category, (counts.get(prompt.category) ?? 0) + 1)
  }
  return counts
}

/** Tags with their usage counts, most used first. */
export function countByTag(prompts: Prompt[]): [tag: string, count: number][] {
  const counts = new Map<string, number>()
  for (const prompt of prompts) {
    for (const tag of prompt.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts].sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b))
}
