import { useMemo } from 'react'
import { filterPrompts } from '../../lib/filterPrompts'
import { href, navigate, updateParams, type Route } from '../../lib/router'
import { countByTag } from '../../lib/search'
import type { UserPrompt } from '../../types/prompt'
import { BrowseLayout } from '../layout/browse-layout'
import { PageHeading } from '../layout/page-heading'
import { SidebarSection } from '../layout/sidebar-section'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { PlusIcon } from '../ui/icons'
import { TagList } from '../ui/tag-list'
import type { PromptActions } from './prompt-actions'
import { PromptCard } from './prompt-card'

interface SavedPromptsPageProps extends PromptActions {
  route: Route
  prompts: UserPrompt[]
  onCreate: () => void
}

export function SavedPromptsPage({ route, prompts, onCreate, ...actions }: SavedPromptsPageProps) {
  const query = route.params.get('q') ?? ''
  const tag = route.params.get('tag')

  const tagCounts = useMemo(() => countByTag(prompts), [prompts])
  const visible = filterPrompts(prompts, { query, tag, category: null })

  const toggleTag = (next: string) => updateParams(route, { tag: tag === next ? null : next })
  const clearFilters = () => navigate(href(route.path), { replace: true })
  const createButton = (
    <Button variant="primary" onClick={onCreate}>
      <PlusIcon className="size-4" />
      Create Prompt
    </Button>
  )

  return (
    <BrowseLayout
      heading={
        <PageHeading
          title="Your Saved Prompts"
          description="Prompts you've written, stored in this browser. They also show up in the main library with a Saved badge."
          actions={prompts.length > 0 && createButton}
        />
      }
      sidebar={
        tagCounts.length > 0 && (
          <SidebarSection title="Labels">
            <TagList
              tags={tagCounts.map(([t]) => t)}
              counts={new Map(tagCounts)}
              activeTag={tag}
              onTagClick={toggleTag}
              className="px-3"
            />
          </SidebarSection>
        )
      }
      count={visible.length}
      noun={['saved prompt', 'saved prompts']}
      activeTag={tag}
      onClearTag={() => updateParams(route, { tag: null })}
      hasFilters={Boolean(query || tag)}
      onClearFilters={clearFilters}
    >
      {prompts.length === 0 ? (
        <EmptyState
          title="No saved prompts yet"
          description="Save a prompt you've written, with labels, to reuse it later."
          action={createButton}
        />
      ) : visible.length === 0 ? (
        <EmptyState title="No saved prompts match your filters." action={<Button onClick={clearFilters}>Clear filters</Button>} />
      ) : (
        <CardGrid
          items={visible}
          getKey={(prompt) => prompt.id}
          renderItem={(prompt) => (
            <PromptCard prompt={prompt} activeTag={tag} onTagClick={toggleTag} {...actions} />
          )}
        />
      )}
    </BrowseLayout>
  )
}
