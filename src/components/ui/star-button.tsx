import { cn } from '../../lib/cn'
import { StarIcon } from './icons'

interface StarButtonProps {
  isStarred: boolean
  onToggle: () => void
  label?: string
  className?: string
}

export function StarButton({ isStarred, onToggle, label, className }: StarButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isStarred ? 'Remove from favorites' : 'Add to favorites'}
      className={cn(
        'inline-flex min-h-[32px] min-w-[32px] items-center justify-center gap-1.5 rounded-md border p-1 text-xs font-medium transition-all',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        isStarred
          ? 'border-amber-400/40 bg-amber-50 text-amber-500 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25'
          : 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 dark:border-white/8 dark:bg-zinc-900/60 dark:text-zinc-500 dark:hover:text-zinc-300',
        label && 'px-2.5 py-1',
        className,
      )}
    >
      <StarIcon filled={isStarred} className={cn('size-3.5 transition-transform active:scale-125', isStarred && 'text-amber-500 dark:text-amber-400')} />
      {label && <span>{isStarred ? 'Favorited' : 'Favorite'}</span>}
    </button>
  )
}
