import { useId, useState } from 'react'
import type { EntityHistoryRecord } from '../../types/history'
import { Button } from '../ui/button'
import { ArrowUturnLeftIcon, CheckIcon, ChevronDownIcon, ClockIcon } from '../ui/icons'
import { Modal, ModalFooter, ModalHeader } from '../ui/modal'

interface EntityHistoryDialogProps {
  record: EntityHistoryRecord
  onRevert: (versionNumber: number) => void
  onClose: () => void
}

export function EntityHistoryDialog({ record, onRevert, onClose }: EntityHistoryDialogProps) {
  const titleId = useId()
  const [expandedRevId, setExpandedRevId] = useState<string | null>(null)
  const [revertingVersion, setRevertingVersion] = useState<number | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  function handleRevertClick(versionNumber: number) {
    onRevert(versionNumber)
    setRevertingVersion(null)
    setFeedbackMessage(
      versionNumber === 0
        ? 'Restored to Original Baseline!'
        : `Reverted to Version ${versionNumber}!`,
    )
    setTimeout(() => {
      setFeedbackMessage(null)
    }, 3000)
  }

  // Reverse order so newest revisions are at the top, down to original baseline
  const sortedRevisions = [...record.revisions].reverse()

  return (
    <Modal open onClose={onClose} labelledBy={titleId} className="w-[min(52rem,calc(100vw-2rem))]">
      <ModalHeader
        titleId={titleId}
        title={
          <div className="flex flex-wrap items-center gap-2">
            <span>Version History</span>
            <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              {record.entityType.toUpperCase()}
            </span>
          </div>
        }
        description={
          <div className="space-y-1">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">{record.title}</p>
            <p className="text-xs text-zinc-500">
              Review snapshots across every edit and easily rollback to any past version.
            </p>
          </div>
        }
        onClose={onClose}
      />

      {feedbackMessage && (
        <div className="flex items-center gap-2 border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckIcon className="size-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      <div className="space-y-3 overflow-y-auto p-5">
        <div className="relative border-l-2 border-zinc-200 pl-4 space-y-4 dark:border-zinc-800 ml-2">
          {sortedRevisions.map((rev) => {
            const isActive = rev.versionNumber === record.currentVersionNumber
            const isOriginal = rev.versionNumber === 0
            const isExpanded = expandedRevId === rev.revisionId

            return (
              <div
                key={rev.revisionId}
                className={`relative rounded-xl border p-4 transition-all ${
                  isActive
                    ? 'border-indigo-500/40 bg-indigo-50/50 dark:border-indigo-500/30 dark:bg-indigo-950/20'
                    : 'border-zinc-200 bg-white dark:border-white/8 dark:bg-canvas-card'
                }`}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[23px] top-5 size-3.5 rounded-full border-2 ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-500'
                      : isOriginal
                        ? 'border-zinc-400 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800'
                        : 'border-amber-400 bg-white dark:bg-zinc-900'
                  }`}
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {isOriginal ? 'v0 (Original Baseline)' : `v${rev.versionNumber} (${rev.label})`}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                        <CheckIcon className="size-3" />
                        Current Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <ClockIcon className="size-3" />
                      {new Date(rev.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!isActive && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRevertingVersion(rev.versionNumber)}
                        className="text-xs"
                      >
                        <ArrowUturnLeftIcon className="size-3 mr-1" />
                        {isOriginal ? 'Revert to Original' : `Revert to v${rev.versionNumber}`}
                      </Button>
                    )}
                  </div>
                </div>

                {rev.summary && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{rev.summary}</p>
                )}

                {/* Confirmation Box for Revert */}
                {revertingVersion === rev.versionNumber && (
                  <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                    <p className="font-medium">
                      Confirm rollback to {isOriginal ? 'Original Baseline' : `Version ${rev.versionNumber}`}?
                    </p>
                    <p className="mt-0.5 text-[11px] opacity-80">
                      Your current active changes will be saved to history before rolling back.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleRevertClick(rev.versionNumber)}
                      >
                        Yes, revert now
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRevertingVersion(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Snapshot Preview toggle */}
                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setExpandedRevId(isExpanded ? null : rev.revisionId)}
                    className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <ChevronDownIcon
                      className={`size-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                    <span>{isExpanded ? 'Hide snapshot content' : 'Preview snapshot content'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 space-y-2 rounded-lg bg-zinc-100 p-3 font-mono text-xs text-zinc-800 dark:bg-canvas-inset dark:text-zinc-200">
                      <SnapshotPreview snapshot={rev.snapshot} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
      </ModalFooter>
    </Modal>
  )
}

function SnapshotPreview({
  snapshot,
}: {
  snapshot: unknown
}) {
  if (!snapshot || typeof snapshot !== 'object') {
    return <span>{String(snapshot)}</span>
  }

  const data = snapshot as Record<string, unknown>
  const title = typeof data.title === 'string' ? data.title : typeof data.name === 'string' ? data.name : null
  const description = typeof data.description === 'string' ? data.description : null
  const body = typeof data.body === 'string' ? data.body : null
  const tags = Array.isArray(data.tags) ? data.tags : null
  const steps = Array.isArray(data.steps) ? data.steps : null

  return (
    <div className="space-y-2">
      {title && (
        <div>
          <span className="text-zinc-400 dark:text-zinc-500">Title: </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
        </div>
      )}
      {description && (
        <div>
          <span className="text-zinc-400 dark:text-zinc-500">Description: </span>
          <span className="text-zinc-700 dark:text-zinc-300">{description}</span>
        </div>
      )}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-zinc-400 dark:text-zinc-500">Tags: </span>
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="rounded bg-zinc-200 px-1 py-0.5 text-[10px] text-zinc-700 dark:bg-white/10 dark:text-zinc-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {body && (
        <div className="mt-1">
          <span className="text-zinc-400 dark:text-zinc-500">Content:</span>
          <pre className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap rounded border border-zinc-200/50 bg-white/50 p-2 text-[11px] dark:border-white/5 dark:bg-black/30">
            {body}
          </pre>
        </div>
      )}
      {steps && steps.length > 0 && (
        <div className="mt-1">
          <span className="text-zinc-400 dark:text-zinc-500">Steps ({steps.length}):</span>
          <ol className="mt-1 list-decimal list-inside space-y-1 text-[11px]">
            {steps.map((step: { promptId: string; note?: string }, idx: number) => (
              <li key={idx} className="text-zinc-700 dark:text-zinc-300">
                <span className="font-semibold">{step.promptId}</span>
                {step.note && <span className="text-zinc-500 ml-1">({step.note})</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
