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
    <div className="mx-auto max-w-7xl px-4 py-6">
      {heading}
      <div className={sidebar ? 'lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8' : undefined}>
        {sidebar && <aside className="lg:sticky lg:top-32 lg:self-start">{sidebar}</aside>}

        <main className={sidebar ? 'mt-4 min-w-0 lg:mt-0' : 'min-w-0'}>
          <div className="mb-4 flex min-h-7 flex-wrap items-center gap-2 text-sm text-zinc-500">
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
