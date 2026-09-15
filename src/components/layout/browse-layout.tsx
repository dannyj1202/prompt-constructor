import type { ReactNode } from 'react'

interface BrowseLayoutProps {
  /** Page title block, rendered above the sidebar and grid. */
  heading?: ReactNode
  sidebar?: ReactNode
  count: number
  noun: [singular: string, plural: string]
  /** Extra text after the count, e.g. " in Analytics". */
  context?: ReactNode
  activeTag?: string | null
  onClearTag?: () => void
  hasFilters: boolean
  onClearFilters: () => void
  children: ReactNode
}

/** Sidebar + results bar + content, shared by every browse page. */
export function BrowseLayout({
  heading,
  sidebar,
  count,
  noun,
  context,
  activeTag,
  onClearTag,
  hasFilters,
  onClearFilters,
  children,
}: BrowseLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {heading}
      <div className={sidebar ? 'lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8' : undefined}>
        {/* On large screens the sidebar is its own translucent rail: a layer between the dotted canvas and the solid cards. */}
        {sidebar && (
          <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8.5rem)] lg:self-start lg:overflow-y-auto lg:rounded-xl lg:border lg:border-zinc-200/70 lg:bg-white/60 lg:p-2 lg:backdrop-blur-sm lg:[scrollbar-width:thin] dark:lg:border-white/[0.06] dark:lg:bg-white/[0.02]">
            {sidebar}
          </aside>
        )}

        <main className={sidebar ? 'mt-5 min-w-0 lg:mt-0' : 'min-w-0'}>
          <div className="mb-4 flex min-h-7 flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              {count} {count === 1 ? noun[0] : noun[1]}
              {context}
            </span>
            {activeTag && onClearTag && (
              <button
                type="button"
                onClick={onClearTag}
                aria-label={`Remove tag filter ${activeTag}`}
                className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white hover:bg-indigo-500"
              >
                #{activeTag} ×
              </button>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="ml-auto text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Clear filters
              </button>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
