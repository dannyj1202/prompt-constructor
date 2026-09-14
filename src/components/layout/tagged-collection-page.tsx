import { useMemo, useState, type ReactNode } from 'react'
import { href, navigate, updateParams, type Route } from '../../lib/router'
import { countByTag, filterTagged } from '../../lib/search'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { TagList } from '../ui/tag-list'
import { BrowseLayout } from './browse-layout'
import { PageHeading } from './page-heading'
import { SidebarSection } from './sidebar-section'

interface TagContext {
  activeTag: string | null
  onTagClick: (tag: string) => void
}

interface TaggedCollectionPageProps<T extends { tags: string[] }> {
  route: Route
  items: T[]
  getKey: (item: T) => string
  /** Text the header search matches against (tags are always included). */
  searchFields: (item: T) => Array<string | undefined>
  title: string
  description: ReactNode
  actions?: ReactNode
  noun: [singular: string, plural: string]
  renderCard: (item: T, context: TagContext & { onOpen: () => void }) => ReactNode
  renderDetail: (item: T, context: TagContext & { onClose: () => void }) => ReactNode
}

/** Heading + tag sidebar + card grid + detail dialog, driven by `?q=` and `?tag=`. */
export function TaggedCollectionPage<T extends { tags: string[] }>({
  route,
  items,
  getKey,
  searchFields,
  title,
  description,
  actions,
  noun,
  renderCard,
  renderDetail,
}: TaggedCollectionPageProps<T>) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const query = route.params.get('q') ?? ''
  const tag = route.params.get('tag')

  const tagCounts = useMemo(() => countByTag(items), [items])
  const visible = filterTagged(items, { query, tag }, searchFields)
  const openItem = items.find((item) => getKey(item) === openKey)

  const toggleTag = (next: string) => updateParams(route, { tag: tag === next ? null : next })
  const clearFilters = () => navigate(href(route.path), { replace: true })

  return (
    <BrowseLayout
      heading={<PageHeading title={title} description={description} actions={actions} />}
      sidebar={
        tagCounts.length > 0 && (
          <SidebarSection title="Tags">
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
      noun={noun}
      activeTag={tag}
      onClearTag={() => updateParams(route, { tag: null })}
      hasFilters={Boolean(query || tag)}
      onClearFilters={clearFilters}
    >
      {visible.length > 0 ? (
        <CardGrid
          items={visible}
          getKey={getKey}
          renderItem={(item) =>
            renderCard(item, { activeTag: tag, onTagClick: toggleTag, onOpen: () => setOpenKey(getKey(item)) })
          }
        />
      ) : (
        <EmptyState
          title={`No ${noun[1]} match your filters.`}
          action={<Button onClick={clearFilters}>Clear filters</Button>}
        />
      )}

      {openItem &&
        renderDetail(openItem, {
          activeTag: tag,
          onTagClick: (next) => {
            setOpenKey(null)
            toggleTag(next)
          },
          onClose: () => setOpenKey(null),
        })}
    </BrowseLayout>
  )
}
