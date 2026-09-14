import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { XIcon } from './icons'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** id of the element that names the dialog */
  labelledBy?: string
  /** Forms turn this off so a stray click doesn't discard input. */
  closeOnBackdrop?: boolean
  className?: string
}

/** Native <dialog> modal: focus trapping, Escape, and top-layer stacking for free. */
export function Modal({ open, onClose, children, labelledBy, closeOnBackdrop = true, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // showModal focuses the first focusable element (the close button), and
      // React's autoFocus runs before the dialog opens, so opt in explicitly.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onClose={onClose}
      // The content fills the dialog, so a click whose target is the dialog
      // itself landed on the backdrop.
      onClick={(event) => closeOnBackdrop && event.target === event.currentTarget && onClose()}
      className={cn(
        'm-auto w-[min(48rem,calc(100vw-2rem))] rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/50 backdrop:backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100',
        className,
      )}
    >
      {open && <div className="flex max-h-[85vh] flex-col">{children}</div>}
    </dialog>
  )
}

interface ModalHeaderProps {
  titleId: string
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  onClose: () => void
}

export function ModalHeader({ titleId, title, eyebrow, description, onClose }: ModalHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800">
      <div className="min-w-0">
        {eyebrow && <div className="mb-0.5 flex items-center gap-2 text-xs font-medium">{eyebrow}</div>}
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <XIcon className="size-5" />
      </button>
    </header>
  )
}

export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-end justify-between gap-3 border-t border-zinc-200 p-5 dark:border-zinc-800',
        className,
      )}
    >
      {children}
    </footer>
  )
}
