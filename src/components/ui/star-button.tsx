import { cn } from '../../lib/cn'
import { StarIcon } from './icons'

interface StarButtonProps {
  isStarred: boolean
  onToggle: () => void
  label?: string
  ariaLabel?: string
  className?: string
}

export function StarButton({ isStarred, onToggle, label, ariaLabel, className }: StarButtonProps) {
  const defaultLabel = isStarred ? 'Remove from favorites' : 'Add to favorites'
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      title={ariaLabel ?? defaultLabel}
      aria-label={ariaLabel ?? defaultLabel}
      className={cn(
        // Same surface, height, and radius as CopyButton so the two sit as a matched pair.
        'inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md border text-xs font-medium transition active:translate-y-px',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        isStarred
          ? 'border-amber-300/70 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25'
          : 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-500 dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:hover:text-zinc-200',
        label ? 'px-2.5' : 'px-1.5',
        className,
      )}
    >
      <StarIcon filled={isStarred} className={cn('size-3.5 transition-transform active:scale-125', isStarred && 'text-amber-500 dark:text-amber-400')} />
      {label && <span>{isStarred ? 'Favorited' : 'Favorite'}</span>}
    </button>
  )
}
