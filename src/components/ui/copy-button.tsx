import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { cn } from '../../lib/cn'
import { CheckIcon, CopyIcon } from './icons'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
}

export function CopyButton({ text, label = 'Copy', className }: CopyButtonProps) {
  const { status, copy } = useCopyToClipboard()
  const copied = status === 'copied'

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={cn(
        // Same surface, height, and radius as StarButton so the two sit as a matched pair.
        'inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium whitespace-nowrap transition active:translate-y-px',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        copied
          ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300'
          : status === 'error'
            ? 'border-red-500/40 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-500/15 dark:text-red-300'
            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-200 dark:hover:border-white/20 dark:hover:bg-white/[0.07]',
        className,
      )}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      {copied ? 'Copied' : status === 'error' ? 'Copy failed' : label}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  )
}
