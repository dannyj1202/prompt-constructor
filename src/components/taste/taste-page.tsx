import { useMemo, useState } from 'react'
import { TASTE_ENTRIES } from '../../data/taste'
import { useEntityHistory } from '../../hooks/useEntityHistory'
import { useSavedTaste } from '../../hooks/useSavedTaste'
import type { Route } from '../../lib/router'
import type { EntityHistoryRecord } from '../../types/history'
import type { TasteEntry, UserTasteInput } from '../../types/taste'
import { EntityHistoryDialog } from '../history/entity-history-dialog'
import { HistoryBadge } from '../history/history-badge'
import { TaggedCollectionPage } from '../layout/tagged-collection-page'
import { Button } from '../ui/button'
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
      <TaggedCollectionPage
        route={route}
        items={allTaste}
        getKey={(entry) => entry.id}
        searchFields={(entry) => [entry.title, entry.description, entry.body, entry.source]}
        title="Taste"
        description="Coding style and conventions from AGENTS.md, constitution.md, and your own engineering preferences. Copy a block into a prompt, or customize any convention to suit your taste."
        actions={
          <Button variant="primary" onClick={() => setFormEntry({})}>
            <PlusIcon className="size-4" />
            Create Taste
          </Button>
        }
        noun={['entry', 'entries']}
        renderCard={(entry, { activeTag, onTagClick, onOpen }) => {
          const history = getHistory('taste', entry.id)
          return (
            <ContentCard
              title={entry.title}
              description={entry.description}
              eyebrow={
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.origin === 'user' && (
                    <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
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
              preview={entry.body}
              tags={entry.tags}
              activeTag={activeTag}
              onTagClick={onTagClick}
              source={entry.source}
              onOpen={onOpen}
              actions={<CopyButton text={entry.body} />}
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
            />
          )
        }}
        renderDetail={(entry, { activeTag, onTagClick, onClose }) => {
          const history = getHistory('taste', entry.id)
          return (
            <DetailDialog
              open
              onClose={onClose}
              title={entry.title}
              description={entry.description}
              eyebrow={
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.origin === 'user' && (
                    <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
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
              body={entry.body}
              tags={entry.tags}
              activeTag={activeTag}
              onTagClick={onTagClick}
              source={entry.source}
              actions={
                <div className="flex items-center gap-2">
                  {history && history.currentVersionNumber > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryRecord(history)}
                      className="text-amber-500 hover:text-amber-600 dark:text-amber-400"
                    >
                      <ClockIcon className="size-3.5 mr-1" />
                      History ({history.revisions.length})
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClose()
                      setFormEntry({ entry })
                    }}
                  >
                    <PencilIcon className="size-3.5 mr-1" />
                    Edit
                  </Button>
                  <CopyButton text={entry.body} />
                </div>
              }
            />
          )
        }}
      />

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
