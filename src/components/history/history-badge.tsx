import { ClockIcon } from '../ui/icons'

interface HistoryBadgeProps {
  versionNumber: number
  totalRevisions?: number
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function HistoryBadge({
  versionNumber,
  totalRevisions,
  onClick,
  size = 'sm',
}: HistoryBadgeProps) {
  const isButton = Boolean(onClick)
  const Component = isButton ? 'button' : 'span'

  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'

  return (
    <Component
      type={isButton ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 font-mono font-medium text-amber-500 transition-colors dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300 ${sizeClass} ${
        isButton
          ? 'cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/20 active:translate-y-px'
          : ''
      }`}
      title={isButton ? 'View edit history & revert versions' : undefined}
    >
      <ClockIcon className="size-3 shrink-0" />
      <span>
        Edited (v{versionNumber}
        {totalRevisions && totalRevisions > 1 ? ` • ${totalRevisions} edits` : ''})
      </span>
    </Component>
  )
}
