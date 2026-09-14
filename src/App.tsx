import { useState } from 'react'
import { Header } from './components/layout/header'
import { CategorySidebar } from './components/prompts/category-sidebar'
import { PromptDetailDialog } from './components/prompts/prompt-detail-dialog'
import { PromptGrid } from './components/prompts/prompt-grid'
import { CATEGORIES, CATEGORY_BY_ID } from './data/categories'
import { BUILT_IN_PROMPTS } from './data/prompts'
import { countByCategory, countByTag, filterPrompts } from './lib/filterPrompts'
import type { CategoryId, Prompt } from './types/prompt'

// User-saved prompts from localStorage get merged in here once the save flow lands.
const ALL_PROMPTS: Prompt[] = BUILT_IN_PROMPTS
const ALL_TAGS = countByTag(ALL_PROMPTS).map(([tag]) => tag)

export default function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [tag, setTag] = useState<string | null>(null)
  const [openPrompt, setOpenPrompt] = useState<Prompt | null>(null)

  // Sidebar counts ignore the selected category so they show where matches live.
  const matchesInAnyCategory = filterPrompts(ALL_PROMPTS, { query, tag, category: null })
  const visible = category ? matchesInAnyCategory.filter((p) => p.category === category) : matchesInAnyCategory
  const hasFilters = Boolean(query || category || tag)

  function toggleTag(next: string) {
    setTag((current) => (current === next ? null : next))
    setOpenPrompt(null)
  }

  function clearFilters() {
    setQuery('')
    setCategory(null)
    setTag(null)
  }

  return (
    <div className="min-h-screen">
      <Header query={query} onQueryChange={setQuery} />

      <div className="mx-auto max-w-7xl px-4 py-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8">
        <aside className="lg:sticky lg:top-22 lg:self-start">
          <CategorySidebar
            categories={CATEGORIES}
            counts={countByCategory(matchesInAnyCategory)}
            total={matchesInAnyCategory.length}
            selected={category}
            onSelect={setCategory}
            tags={ALL_TAGS}
            activeTag={tag}
            onTagClick={toggleTag}
          />
        </aside>

        <main className="mt-4 min-w-0 lg:mt-0">
          <div className="mb-4 flex min-h-7 flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span>
              {visible.length} {visible.length === 1 ? 'prompt' : 'prompts'}
              {category && (
                <>
                  {' in '}
                  <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                    {CATEGORY_BY_ID[category].name}
                  </strong>
                </>
              )}
            </span>
            {tag && (
              <button
                type="button"
                onClick={() => setTag(null)}
                aria-label={`Remove tag filter ${tag}`}
                className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white hover:bg-indigo-500"
              >
                #{tag} ×
              </button>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Clear filters
              </button>
            )}
          </div>

          <PromptGrid
            prompts={visible}
            activeTag={tag}
            onOpen={setOpenPrompt}
            onTagClick={toggleTag}
            onClearFilters={clearFilters}
          />
        </main>
      </div>

      <PromptDetailDialog
        prompt={openPrompt}
        activeTag={tag}
        onClose={() => setOpenPrompt(null)}
        onTagClick={toggleTag}
      />
    </div>
  )
}
