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
  source,
  onOpen,
  highlighted = false,
  actions,
  footer,
  children,
}: ContentCardProps) {
  return (
    <article
      onMouseMove={trackSpotlight}
      className={cn(
        'group relative flex w-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-white/8 dark:bg-canvas-card dark:hover:border-white/15',
        highlighted && 'border-indigo-500 ring-2 ring-indigo-500/40 dark:border-indigo-400 dark:ring-indigo-400/30',
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">{eyebrow}</div>}
            <h3 className="mt-0.5 leading-snug font-semibold">
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
          </div>
          {actions && <div className="relative z-10 flex shrink-0 items-center gap-1">{actions}</div>}
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>

        {preview && (
          <div className="relative mt-3">
            <pre className="line-clamp-2 rounded-lg bg-zinc-50 p-3 font-mono text-xs whitespace-pre-wrap text-zinc-700 dark:bg-canvas-inset dark:text-zinc-300">
              {preview}
            </pre>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 rounded-b-lg bg-gradient-to-t from-zinc-50 to-transparent dark:from-canvas-inset" />
          </div>
        )}

        {children}

        <div className="mt-auto space-y-2 pt-3">
          {onTagClick && (
            <TagList tags={tags} activeTag={activeTag} onTagClick={onTagClick} className="relative z-10" />
          )}
          {(source || footer) && (
            <div className="flex items-center justify-between gap-3">
              {source ? (
                <p className="min-w-0 flex-1 truncate text-xs text-zinc-500" title={source}>
                  Source: <code className="inline-block max-w-full truncate align-bottom font-mono">{source}</code>
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
