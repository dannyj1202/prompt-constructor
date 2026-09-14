import { cn } from '../../lib/cn'
import type { Category, CategoryId } from '../../types/prompt'
import { SidebarSection } from '../layout/sidebar-section'
import { TagList } from '../ui/tag-list'

interface CategorySidebarProps {
  categories: Category[]
  /** Matches per category for the current search and tag (ignoring the selected category). */
  counts: Map<CategoryId, number>
  total: number
  selected: CategoryId | null
  onSelect: (id: CategoryId | null) => void
  tags: string[]
  activeTag: string | null
  onTagClick: (tag: string) => void
}

export function CategorySidebar({
  categories,
  counts,
  total,
  selected,
  onSelect,
  tags,
  activeTag,
  onTagClick,
}: CategorySidebarProps) {
  const items: { id: CategoryId | null; name: string; title?: string; count: number }[] = [
    { id: null, name: 'All prompts', count: total },
    ...categories.map((c) => ({ id: c.id, name: c.name, title: c.description, count: counts.get(c.id) ?? 0 })),
  ]

  return (
    <div className="space-y-6">
      <nav aria-label="Categories">
        <h2 className="mb-2 hidden px-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase lg:block">
          Categories
        </h2>
        {/* Horizontal chip row on small screens, vertical list on large. */}
        <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
          {items.map((item) => {
            const active = item.id === selected
            return (
              <li key={item.id ?? 'all'} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  title={item.title}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500',
                    active
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800/60',
                    !active && item.count === 0 && 'opacity-50',
                  )}
                >
                  <span>{item.name}</span>
                  <span className={cn('text-xs tabular-nums', active ? 'opacity-80' : 'text-zinc-400')}>
                    {item.count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {tags.length > 0 && (
        <SidebarSection title="Tags" className="hidden lg:block">
          <TagList tags={tags} activeTag={activeTag} onTagClick={onTagClick} className="px-3" />
        </SidebarSection>
      )}
    </div>
  )
}
