import { useMemo } from 'react'
import { CATEGORIES, CATEGORY_BY_ID, isCategoryId } from '../../data/categories'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { useGridKeyboardNav } from '../../hooks/useGridKeyboardNav'
import { countByCategory, filterPrompts } from '../../lib/filterPrompts'
import { href, navigate, updateParams, type Route } from '../../lib/router'
import { countByTag } from '../../lib/search'
import type { Prompt } from '../../types/prompt'
import { BrowseLayout } from '../layout/browse-layout'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { CopyToast } from '../ui/copy-toast'
import { CategorySidebar } from './category-sidebar'
import type { PromptActions } from './prompt-actions'
import { PromptCard } from './prompt-card'

interface PromptsPageProps extends PromptActions {
  route: Route
  /** Built-in and saved prompts together. */
  prompts: Prompt[]
}

export function PromptsPage({ route, prompts, ...actions }: PromptsPageProps) {
  const query = route.params.get('q') ?? ''
  const rawCategory = route.params.get('category')
  const category = isCategoryId(rawCategory) ? rawCategory : null
  const tag = route.params.get('tag')

  const allTags = useMemo(() => countByTag(prompts).map(([t]) => t), [prompts])
  // Sidebar counts ignore the selected category so they show where matches live.
  const matchesInAnyCategory = useMemo(
    () => filterPrompts(prompts, { query, tag, category: null }),
    [prompts, query, tag],
  )
  const visible = useMemo(
    () => (category ? matchesInAnyCategory.filter((p) => p.category === category) : matchesInAnyCategory),
    [matchesInAnyCategory, category],
  )

  const { copy, status: copyStatus } = useCopyToClipboard()
  const { activeIndex } = useGridKeyboardNav({
    items: visible,
    onOpen: actions.onOpen,
    onCopy: (prompt) => copy(prompt.body),
  })
  const activeId = visible[activeIndex]?.id

  const toggleTag = (next: string) => updateParams(route, { tag: tag === next ? null : next })
  const clearFilters = () => navigate(href(route.path), { replace: true })

  return (
    <>
      <CopyToast status={copyStatus} />
      <BrowseLayout
        sidebar={
          <CategorySidebar
            categories={CATEGORIES}
            counts={countByCategory(matchesInAnyCategory)}
            total={matchesInAnyCategory.length}
            selected={category}
            onSelect={(id) => updateParams(route, { category: id })}
            tags={allTags}
            activeTag={tag}
            onTagClick={toggleTag}
          />
        }
        count={visible.length}
        noun={['prompt', 'prompts']}
        context={
          category && (
            <>
              {' in '}
              <strong className="font-medium text-zinc-900 dark:text-zinc-100">
                {CATEGORY_BY_ID[category].name}
              </strong>
            </>
          )
        }
        activeTag={tag}
        onClearTag={() => updateParams(route, { tag: null })}
        hasFilters={Boolean(query || category || tag)}
        onClearFilters={clearFilters}
      >
        {visible.length > 0 ? (
          <CardGrid
            items={visible}
            getKey={(prompt) => prompt.id}
            renderItem={(prompt) => (
              <PromptCard
                prompt={prompt}
                activeTag={tag}
                onTagClick={toggleTag}
                highlighted={prompt.id === activeId}
                {...actions}
              />
            )}
          />
        ) : (
          <EmptyState
            title="No prompts match your filters."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        )}
      </BrowseLayout>
    </>
  )
}
