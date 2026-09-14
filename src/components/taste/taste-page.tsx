import { useMemo, useState } from 'react'
import { TASTE_ENTRIES } from '../../data/taste'
import { useEntityHistory } from '../../hooks/useEntityHistory'
import { useSavedTaste } from '../../hooks/useSavedTaste'
import { parseTasteRules } from '../../lib/formatContent'
import { href, navigate, updateParams, type Route } from '../../lib/router'
import { filterTagged } from '../../lib/search'
import type { EntityHistoryRecord } from '../../types/history'
import type { TasteEntry, UserTasteInput } from '../../types/taste'
import { EntityHistoryDialog } from '../history/entity-history-dialog'
import { HistoryBadge } from '../history/history-badge'
import { BrowseLayout } from '../layout/browse-layout'
import { PageHeading } from '../layout/page-heading'
import { Button } from '../ui/button'
import { CardGrid, EmptyState } from '../ui/card-grid'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'
import { ClockIcon, PencilIcon, PlusIcon, TrashIcon } from '../ui/icons'
import { TasteFormDialog } from './taste-form-dialog'

export function TastePage({ route }: { route: Route }) {
  const { tasteEntries: userTaste, create, update, remove } = useSavedTaste()
  const { getHistory, saveEdit, revertToVersion, histories } = useEntityHistory()
  const [formEntry, setFormEntry] = useState<{ entry?: TasteEntry } | null>(null)
  const [historyRecord, setHistoryRecord] = useState<EntityHistoryRecord | null>(null)
  const [openEntryId, setOpenEntryId] = useState<string | null>(null)

  const allTaste = useMemo(() => {
    const tasteHistories = new Map(
      histories.filter((h) => h.entityType === 'taste').map((h) => [h.entityId, h]),
    )
    return [...userTaste, ...TASTE_ENTRIES].map((t) => {
      const h = tasteHistories.get(t.id)
      return h ? { ...t, ...(h.currentSnapshot as Partial<TasteEntry>) } : t
    })
  }, [userTaste, histories])

  const tagSuggestions = useMemo(() => Array.from(new Set(allTaste.flatMap((t) => t.tags))), [allTaste])

  const query = route.params.get('q') ?? ''
  const tag = route.params.get('tag')
  const visible = filterTagged(allTaste, { query, tag }, (entry) => [
    entry.title,
    entry.description,
    entry.body,
    entry.source,
  ])
  const openEntry = allTaste.find((e) => e.id === openEntryId)
  const clearFilters = () => navigate(href(route.path), { replace: true })

  function handleSubmit(input: UserTasteInput) {
    if (formEntry?.entry) {
      const target = formEntry.entry
      if (target.origin === 'user') {
        update(target.id, input)
      }
      saveEdit('taste', target.id, input.title, target, { ...target, ...input }, 'Saved taste modifications')
    } else {
      create(input)
    }
    setFormEntry(null)
  }

  function handleRevert(versionNumber: number) {
    if (!historyRecord) return
    const updated = revertToVersion<TasteEntry>('taste', historyRecord.entityId, versionNumber)
    if (updated) {
      setHistoryRecord(updated)
      const snap = updated.currentSnapshot
      if (userTaste.some((t) => t.id === updated.entityId)) {
        update(updated.entityId, {
          title: snap.title,
          description: snap.description,
          tags: snap.tags,
          source: snap.source,
          body: snap.body,
        })
      }
    }
  }

  return (
    <>
      <BrowseLayout
        heading={
          <PageHeading
            title="Taste"
            description="Coding style and conventions from AGENTS.md, constitution.md, and your preferences. Copy a block directly into a prompt, or customize any convention."
            actions={
              <Button variant="primary" onClick={() => setFormEntry({})}>
                <PlusIcon className="size-4" />
                Create Taste
              </Button>
            }
          />
        }
        count={visible.length}
        noun={['convention', 'conventions']}
        activeTag={tag}
        onClearTag={() => updateParams(route, { tag: null })}
        hasFilters={Boolean(query || tag)}
        onClearFilters={clearFilters}
      >
        {visible.length > 0 ? (
          <CardGrid
            items={visible}
            getKey={(entry) => entry.id}
            renderItem={(entry) => {
              const history = getHistory('taste', entry.id)
              const rules = parseTasteRules(entry.body)
              const sourceParts = entry.source.split(/\s*[-:]\s*/)
              const sourceDoc = sourceParts[0]?.trim() || 'AGENTS.md'
              const sourceSection = sourceParts.slice(1).join(' - ').trim()

              return (
                <ContentCard
                  id={`taste-card-${entry.id}`}
                  title={entry.title}
                  description={entry.description}
                  eyebrow={
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                        {sourceDoc}
                      </span>
                      {sourceSection && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {sourceSection}
                        </span>
                      )}
                      {entry.origin === 'user' && (
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                          Custom
                        </span>
                      )}
                      {history && history.currentVersionNumber > 0 && (
                        <HistoryBadge
                          versionNumber={history.currentVersionNumber}
                          totalRevisions={history.revisions.length}
                          onClick={() => setHistoryRecord(history)}
                        />
                      )}
                    </div>
                  }
                  onOpen={() => setOpenEntryId(entry.id)}
                  actions={<CopyButton text={entry.body} label="Copy convention" />}
                  footer={
                    <div className="flex items-center gap-1">
                      {history && history.currentVersionNumber > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setHistoryRecord(history)}
                          title="View revision history"
                          className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                        >
                          <ClockIcon className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormEntry({ entry })}
                        aria-label={`Edit ${entry.title}`}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      {entry.origin === 'user' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(entry.id)}
                          aria-label={`Delete ${entry.title}`}
                          className="hover:text-red-600 dark:hover:text-red-400"
                        >
                          <TrashIcon className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  }
                >
                  {rules.length > 0 && (
                    <ol className="mt-3 space-y-1.5">
                      {rules.slice(0, 3).map((rule, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                          <span className="flex size-4.5 shrink-0 items-center justify-center rounded bg-zinc-100 font-mono text-[11px] font-semibold text-zinc-500 tabular-nums dark:bg-canvas-inset dark:text-zinc-400">
                            {idx + 1}
                          </span>
                          <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">{rule}</span>
                        </li>
                      ))}
                      {rules.length > 3 && (
                        <li className="pl-6 text-xs text-zinc-400 dark:text-zinc-500">
                          +{rules.length - 3} more standards
                        </li>
                      )}
                    </ol>
                  )}
                </ContentCard>
              )
            }}
          />
        ) : (
          <EmptyState
            title="No conventions match your search."
            action={<Button onClick={clearFilters}>Clear search</Button>}
          />
        )}

        {openEntry && (
          <DetailDialog
            open
            onClose={() => setOpenEntryId(null)}
            title={openEntry.title}
            description={openEntry.description}
            eyebrow={
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-xs font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                  {openEntry.source}
                </span>
                {openEntry.origin === 'user' && (
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                    Custom
                  </span>
                )}
              </div>
            }
            body={openEntry.body}
            tags={openEntry.tags}
            activeTag={tag}
            onTagClick={(next) => {
              setOpenEntryId(null)
              updateParams(route, { tag: tag === next ? null : next })
            }}
            source={openEntry.source}
            actions={
              <div className="flex items-center gap-2">
                {(() => {
                  const history = getHistory('taste', openEntry.id)
                  return history && history.currentVersionNumber > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryRecord(history)}
                      className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                    >
                      <ClockIcon className="mr-1 size-3.5" />
                      History ({history.revisions.length})
                    </Button>
                  ) : null
                })()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpenEntryId(null)
                    setFormEntry({ entry: openEntry })
                  }}
                >
                  <PencilIcon className="mr-1 size-3.5" />
                  Edit
                </Button>
                <CopyButton text={openEntry.body} label="Copy convention" />
              </div>
            }
          />
        )}
      </BrowseLayout>

      {formEntry && (
        <TasteFormDialog
          entry={formEntry.entry}
          tagSuggestions={tagSuggestions}
          onSubmit={handleSubmit}
          onClose={() => setFormEntry(null)}
        />
      )}

      {historyRecord && (
        <EntityHistoryDialog
          record={historyRecord}
          onRevert={handleRevert}
          onClose={() => setHistoryRecord(null)}
        />
      )}
    </>
  )
}
