import type { ReactNode } from 'react'
import { TagList } from './tag-list'

interface ContentCardProps {
  title: string
  description: string
  /** Small label above the title (e.g. category name, badges). */
  eyebrow?: ReactNode
  /** Monospace excerpt of the body. */
  preview?: string
  tags?: string[]
  activeTag?: string | null
  onTagClick?: (tag: string) => void
  source?: string
  /** Makes the whole card a button that opens a detail view. */
  onOpen?: () => void
  /** Top-right controls, e.g. the copy button. Rendered above the stretched button. */
  actions?: ReactNode
  /** Extra footer content, e.g. edit/delete controls. */
  footer?: ReactNode
  children?: ReactNode
}

/** Shared card shell for prompts, skills, taste entries, and workflows. */
export function ContentCard({
  title,
  description,
  eyebrow,
  preview,
  tags = [],
  activeTag = null,
  onTagClick,
  source,
  onOpen,
  actions,
  footer,
  children,
}: ContentCardProps) {
  return (
    <article className="relative flex w-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md dark:border-white/8 dark:bg-canvas-card dark:hover:border-white/15">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">{eyebrow}</div>}
          <h3 className="mt-0.5 leading-snug font-semibold">
            {onOpen ? (
              // Stretched button: the whole card opens the detail view, while
              // actions and tags sit above it on z-10.
              <button
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
        <pre className="mt-3 line-clamp-5 rounded-lg bg-zinc-50 p-3 font-mono text-xs whitespace-pre-wrap text-zinc-700 dark:bg-canvas-inset dark:text-zinc-300">
          {preview}
        </pre>
      )}

      {children}

      <div className="mt-auto space-y-2 pt-3">
        {onTagClick && (
          <TagList tags={tags} activeTag={activeTag} onTagClick={onTagClick} className="relative z-10" />
        )}
        {(source || footer) && (
          <div className="flex items-center justify-between gap-3">
            {source ? (
              <p className="min-w-0 truncate text-xs text-zinc-500" title={source}>
                Source: <code className="font-mono">{source}</code>
              </p>
            ) : (
              <span />
            )}
            {footer && <div className="relative z-10 flex shrink-0 items-center gap-1">{footer}</div>}
          </div>
        )}
      </div>
    </article>
  )
}
