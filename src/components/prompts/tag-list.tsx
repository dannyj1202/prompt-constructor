import { cn } from '../../lib/cn'

interface TagListProps {
  tags: string[]
  activeTag: string | null
  onTagClick: (tag: string) => void
  className?: string
}

export function TagList({ tags, activeTag, onTagClick, className }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)}>
      {tags.map((tag) => (
        <li key={tag}>
          <button
            type="button"
            onClick={() => onTagClick(tag)}
            aria-pressed={tag === activeTag}
            className={cn(
              'rounded-full px-2 py-0.5 text-xs transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500',
              tag === activeTag
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
            )}
          >
            #{tag}
          </button>
        </li>
      ))}
    </ul>
  )
}
