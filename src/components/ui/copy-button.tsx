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
        'inline-flex min-h-[32px] min-w-[32px] items-center justify-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition active:translate-y-px',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        copied
          ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : status === 'error'
            ? 'border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
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
