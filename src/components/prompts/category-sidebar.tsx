import type { ComponentType, SVGProps } from 'react'
import { CATEGORY_ACCENT_TEXT } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { Category, CategoryAccent, CategoryId } from '../../types/prompt'
import { SidebarSection } from '../layout/sidebar-section'
import {
  BarChartIcon,
  BugIcon,
  FlagIcon,
  GitBranchIcon,
  GlobeIcon,
  GridIcon,
  LayersIcon,
  PackageIcon,
  StarIcon,
  SwatchIcon,
} from '../ui/icons'
import { TagList } from '../ui/tag-list'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const CATEGORY_ICONS: Record<CategoryId, IconComponent> = {
  'onboarding-setup': FlagIcon,
  'git-pr-workflow': GitBranchIcon,
  'release-dependencies': PackageIcon,
  'code-scaffolding': LayersIcon,
  'ui-design-system': SwatchIcon,
  'content-i18n': GlobeIcon,
  'investigation-debugging': BugIcon,
  analytics: BarChartIcon,
}

/** Literal class strings so Tailwind's build-time scanner can find them. */
const ACCENT_STYLES: Record<CategoryAccent | 'neutral', { iconBg: string; iconText: string; activeBg: string; activeText: string; countBg: string; countText: string }> = {
  neutral: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-500/15',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    activeBg: 'bg-indigo-50 dark:bg-indigo-500/10',
    activeText: 'text-indigo-950 dark:text-indigo-100',
    countBg: 'bg-indigo-100 dark:bg-indigo-500/20',
    countText: 'text-indigo-700 dark:text-indigo-300',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
    iconText: CATEGORY_ACCENT_TEXT.emerald,
    activeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    activeText: 'text-emerald-950 dark:text-emerald-100',
    countBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    countText: 'text-emerald-700 dark:text-emerald-300',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-500/15',
    iconText: CATEGORY_ACCENT_TEXT.violet,
    activeBg: 'bg-violet-50 dark:bg-violet-500/10',
    activeText: 'text-violet-950 dark:text-violet-100',
    countBg: 'bg-violet-100 dark:bg-violet-500/20',
    countText: 'text-violet-700 dark:text-violet-300',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-500/15',
    iconText: CATEGORY_ACCENT_TEXT.amber,
    activeBg: 'bg-amber-50 dark:bg-amber-500/10',
    activeText: 'text-amber-950 dark:text-amber-100',
    countBg: 'bg-amber-100 dark:bg-amber-500/20',
    countText: 'text-amber-700 dark:text-amber-300',
  },
  cyan: {
    iconBg: 'bg-cyan-100 dark:bg-cyan-500/15',
    iconText: CATEGORY_ACCENT_TEXT.cyan,
    activeBg: 'bg-cyan-50 dark:bg-cyan-500/10',
    activeText: 'text-cyan-950 dark:text-cyan-100',
    countBg: 'bg-cyan-100 dark:bg-cyan-500/20',
    countText: 'text-cyan-700 dark:text-cyan-300',
  },
  pink: {
    iconBg: 'bg-pink-100 dark:bg-pink-500/15',
    iconText: CATEGORY_ACCENT_TEXT.pink,
    activeBg: 'bg-pink-50 dark:bg-pink-500/10',
    activeText: 'text-pink-950 dark:text-pink-100',
    countBg: 'bg-pink-100 dark:bg-pink-500/20',
    countText: 'text-pink-700 dark:text-pink-300',
  },
  sky: {
    iconBg: 'bg-sky-100 dark:bg-sky-500/15',
    iconText: CATEGORY_ACCENT_TEXT.sky,
    activeBg: 'bg-sky-50 dark:bg-sky-500/10',
    activeText: 'text-sky-950 dark:text-sky-100',
    countBg: 'bg-sky-100 dark:bg-sky-500/20',
    countText: 'text-sky-700 dark:text-sky-300',
  },
  rose: {
    iconBg: 'bg-rose-100 dark:bg-rose-500/15',
    iconText: CATEGORY_ACCENT_TEXT.rose,
    activeBg: 'bg-rose-50 dark:bg-rose-500/10',
    activeText: 'text-rose-950 dark:text-rose-100',
    countBg: 'bg-rose-100 dark:bg-rose-500/20',
    countText: 'text-rose-700 dark:text-rose-300',
  },
  lime: {
    iconBg: 'bg-lime-100 dark:bg-lime-500/15',
    iconText: CATEGORY_ACCENT_TEXT.lime,
    activeBg: 'bg-lime-50 dark:bg-lime-500/10',
    activeText: 'text-lime-950 dark:text-lime-100',
    countBg: 'bg-lime-100 dark:bg-lime-500/20',
    countText: 'text-lime-700 dark:text-lime-300',
  },
}

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
  starredOnly?: boolean
  onToggleStarredOnly?: () => void
  starredCount?: number
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
  starredOnly = false,
  onToggleStarredOnly,
  starredCount,
}: CategorySidebarProps) {
  const items: {
    id: CategoryId | null
    name: string
    title?: string
    count: number
    Icon: IconComponent
    accent: CategoryAccent | 'neutral'
    isStarred?: boolean
  }[] = [
    { id: null, name: 'All prompts', count: total, Icon: GridIcon, accent: 'neutral' },
    ...(starredCount !== undefined && onToggleStarredOnly
      ? [{ id: null, name: 'Favorites', title: 'Starred prompts', count: starredCount, Icon: StarIcon, accent: 'amber' as const, isStarred: true }]
      : []),
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      title: c.description,
      count: counts.get(c.id) ?? 0,
      Icon: CATEGORY_ICONS[c.id],
      accent: c.accent,
    })),
  ]

  return (
    <div className="space-y-5">
      <nav aria-label="Categories">
        <h2 className="mb-1.5 hidden px-3 text-xs font-medium text-zinc-500 lg:block dark:text-zinc-400">Categories</h2>
        {/* Horizontal chip row on small screens, vertical list on large. */}
        <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-px lg:overflow-visible lg:px-0 lg:pb-0">
          {items.map((item) => {
            const active = item.isStarred ? starredOnly : !starredOnly && item.id === selected
            const style = ACCENT_STYLES[item.accent]
            return (
              <li key={item.isStarred ? 'starred' : (item.id ?? 'all')} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (item.isStarred) {
                      onToggleStarredOnly?.()
                    } else {
                      if (starredOnly) onToggleStarredOnly?.()
                      onSelect(item.id)
                    }
                  }}
                  title={item.title}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 text-sm whitespace-nowrap transition-colors',
                    // Inset outline: the sidebar rail scrolls, so an outset one would be clipped at its edges.
                    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500',
                    active
                      ? cn(style.activeBg, style.activeText, 'font-medium')
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 max-lg:bg-white max-lg:ring-1 max-lg:ring-zinc-200 max-lg:ring-inset dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-zinc-100 dark:max-lg:bg-canvas-card dark:max-lg:ring-white/[0.08]',
                    !active && item.count === 0 && 'opacity-50',
                  )}
                >
                  {/* The accent glyph always carries the category's identity; its tinted tile appears only when active. */}
                  <span
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-md transition-colors',
                      style.iconText,
                      active && style.iconBg,
                    )}
                  >
                    <item.Icon className="size-3.5" strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left">{item.name}</span>
                  <span
                    className={cn(
                      'min-w-6 shrink-0 rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums',
                      active ? cn(style.countBg, style.countText, 'font-medium') : 'text-zinc-500 dark:text-zinc-400',
                    )}
                  >
                    {item.count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {tags.length > 0 && (
        <SidebarSection title="Tags" className="hidden border-t border-zinc-200/70 pt-4 lg:block dark:border-white/[0.06]">
          <TagList tags={tags} activeTag={activeTag} onTagClick={onTagClick} className="px-3" />
        </SidebarSection>
      )}
    </div>
  )
}
