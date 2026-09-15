import { cn } from '../../lib/cn'

interface TagListProps {
  tags: string[]
  activeTag: string | null
  onTagClick: (tag: string) => void
  /** Optional count shown after each tag. */
  counts?: Map<string, number>
  className?: string
}

export function TagList({ tags, activeTag, onTagClick, counts, className }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <ul className={cn('flex flex-wrap gap-x-1 gap-y-0.5', className)}>
      {tags.map((tag) => (
        <li key={tag}>
          {/* Quiet text chips at rest (a surface only on hover); the active tag gets the one indigo fill. */}
          <button
            type="button"
            onClick={() => onTagClick(tag)}
            aria-pressed={tag === activeTag}
            className={cn(
              'rounded-md px-1.5 py-0.5 text-xs transition-colors',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500',
              tag === activeTag
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100',
            )}
          >
            <span className={tag === activeTag ? 'opacity-70' : 'opacity-50'}>#</span>
            {tag}
            {counts && <span className="ml-1 tabular-nums opacity-60">{counts.get(tag) ?? 0}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}
