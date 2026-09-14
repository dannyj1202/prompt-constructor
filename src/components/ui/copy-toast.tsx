import type { CopyStatus } from '../../hooks/useCopyToClipboard'
import { CheckIcon } from './icons'

/** Instant feedback for the keyboard copy shortcut (c / Cmd+C on the highlighted card). */
export function CopyToast({ status }: { status: CopyStatus }) {
  if (status !== 'copied') return null

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center">
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 shadow-lg dark:bg-emerald-950 dark:text-emerald-300">
        <CheckIcon className="size-4" />
        Copied to clipboard
      </span>
    </div>
  )
}
