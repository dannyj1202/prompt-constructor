import type { MouseEvent, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { TagList } from './tag-list'

interface ContentCardProps {
  title: string
  description: string
  /** Applied to the stretched open button, so keyboard grid-nav can move real focus here. */
  id?: string
  /** Small label above the title (e.g. category name, badges). */
  eyebrow?: ReactNode
  /** Monospace excerpt of the body, clipped to two lines. */
  preview?: string
  tags?: string[]
  activeTag?: string | null
  onTagClick?: (tag: string) => void
  /** Whether to show tag pills on the card face. Default false to avoid bloat. */
  showTags?: boolean
  source?: string
  /** Makes the whole card a button that opens a detail view. */
  onOpen?: () => void
  /** Keyboard grid navigation's current pick — shows a persistent ring, independent of hover. */
  highlighted?: boolean
  /** Top-right controls, e.g. the copy button. Rendered above the stretched button. */
  actions?: ReactNode
  /** Extra footer content, e.g. edit/delete controls. */
  footer?: ReactNode
  children?: ReactNode
}

/** Feeds the cursor position to the spotlight/border-glow layers as CSS vars. */
function trackSpotlight(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
}

/** Shared card shell for prompts, skills, taste entries, and workflows. */
export function ContentCard({
  title,
  description,
  id,
  eyebrow,
  preview,
  tags = [],
  activeTag = null,
  onTagClick,
  showTags = false,
  source,
  onOpen,
  highlighted = false,
  actions,
  footer,
  children,
}: ContentCardProps) {
  const hasMetaRow = Boolean(eyebrow || actions)

  return (
    <article
      onMouseMove={trackSpotlight}
      className={cn(
        'group relative flex w-full flex-col rounded-xl border bg-white p-5 transition-[border-color,box-shadow] duration-200 dark:bg-canvas-card',
        // Light mode lifts on a soft cast shadow; dark mode stays tonal (border only), per DESIGN.md.
        'shadow-[0_1px_2px_rgb(24_24_27/0.04)] hover:shadow-[0_10px_28px_-14px_rgb(24_24_27/0.22)] dark:shadow-none dark:hover:shadow-none',
        highlighted
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 dark:border-indigo-400 dark:ring-indigo-400/30'
          : 'border-zinc-200/80 hover:border-zinc-300 dark:border-white/[0.07] dark:hover:border-white/15',
      )}
    >
      {/* Cursor-tracking spotlight: a soft flood behind the content, plus a border ring that only shows a 1px edge via mask-composite. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(360px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgb(99 102 241 / 0.1), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: 1,
          background:
            'radial-gradient(360px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgb(99 102 241 / 0.55), transparent 70%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      <div className="relative z-[1] flex flex-1 flex-col">
        {/* Meta row: labels left, actions right, so the title below gets the card's full width. */}
        {hasMetaRow && (
          <div className="flex min-h-8 items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-medium">{eyebrow}</div>
            {actions && <div className="relative z-10 flex shrink-0 items-center gap-1.5">{actions}</div>}
          </div>
        )}

        <h3
          className={cn(
            'text-base leading-snug font-semibold tracking-[-0.01em] text-zinc-900 dark:text-zinc-50',
            hasMetaRow && 'mt-2.5',
          )}
        >
          {onOpen ? (
            // Stretched button: the whole card opens the detail view, while
            // actions and tags sit above it on z-10.
            <button
              id={id}
              type="button"
              onClick={onOpen}
              className="text-left after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-indigo-500"
            >
              {title}
            </button>
          ) : (
            title
          )}
        </h3>

        {/* Two lines reserved so descriptions start and end at the same height across a row. */}
        <p className="mt-1.5 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p>

        {preview && (
          // Recessed well (canvas-inset) marks this as literal, copyable text. Padding lives on the
          // wrapper so the two-line clamp can't leak a third line into it.
          <div className="mt-4 rounded-lg bg-zinc-50 px-3 py-2.5 ring-1 ring-zinc-200/70 ring-inset dark:bg-canvas-inset dark:ring-white/[0.05]">
            <pre className="line-clamp-2 font-mono text-xs leading-5 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
              {preview}
            </pre>
          </div>
        )}

        {children}

        <div className="mt-auto pt-4">
          {showTags && onTagClick && tags.length > 0 && (
            <TagList tags={tags} activeTag={activeTag} onTagClick={onTagClick} className="relative z-10 mb-3" />
          )}
          {(source || footer) && (
            <div className="flex min-h-8 items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-white/[0.06]">
              {source ? (
                <p className="flex min-w-0 flex-1 items-baseline gap-1 text-xs text-zinc-500 dark:text-zinc-400" title={source}>
                  <span className="shrink-0">Source:</span>
                  <code className="min-w-0 truncate font-mono">{source}</code>
                </p>
              ) : (
                <span />
              )}
              {footer && <div className="relative z-10 flex shrink-0 items-center gap-1">{footer}</div>}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
