import { useMemo, useState } from 'react'
import { TASTE_ENTRIES } from '../../data/taste'
import { useSavedTaste } from '../../hooks/useSavedTaste'
import type { Route } from '../../lib/router'
import type { TasteEntry, UserTasteInput } from '../../types/taste'
import { TaggedCollectionPage } from '../layout/tagged-collection-page'
import { Button } from '../ui/button'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'
import { PencilIcon, PlusIcon, TrashIcon } from '../ui/icons'
import { TasteFormDialog } from './taste-form-dialog'

export function TastePage({ route }: { route: Route }) {
  const { tasteEntries: userTaste, create, update, remove } = useSavedTaste()
  const [formEntry, setFormEntry] = useState<{ entry?: TasteEntry } | null>(null)

  const allTaste = useMemo(() => [...userTaste, ...TASTE_ENTRIES], [userTaste])
  const tagSuggestions = useMemo(() => Array.from(new Set(allTaste.flatMap((t) => t.tags))), [allTaste])

  function handleSubmit(input: UserTasteInput) {
    if (formEntry?.entry) {
      update(formEntry.entry.id, input)
    } else {
      create(input)
    }
    setFormEntry(null)
  }

  return (
    <>
      <TaggedCollectionPage
        route={route}
        items={allTaste}
        getKey={(entry) => entry.id}
        searchFields={(entry) => [entry.title, entry.description, entry.body, entry.source]}
        title="Taste"
        description="Coding style and conventions from AGENTS.md, constitution.md, and your own engineering preferences. Copy a block into a prompt or agent instructions."
        actions={
          <Button variant="primary" onClick={() => setFormEntry({})}>
            <PlusIcon className="size-4" />
            Create Taste
          </Button>
        }
        noun={['entry', 'entries']}
        renderCard={(entry, { activeTag, onTagClick, onOpen }) => (
          <ContentCard
            title={entry.title}
            description={entry.description}
            eyebrow={
              entry.origin === 'user' ? (
                <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  Custom
                </span>
              ) : undefined
            }
            preview={entry.body}
            tags={entry.tags}
            activeTag={activeTag}
            onTagClick={onTagClick}
            source={entry.source}
            onOpen={onOpen}
            actions={<CopyButton text={entry.body} />}
            footer={
              entry.origin === 'user' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormEntry({ entry })}
                    aria-label={`Edit ${entry.title}`}
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(entry.id)}
                    aria-label={`Delete ${entry.title}`}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="size-3.5" />
                  </Button>
                </div>
              )
            }
          />
        )}
        renderDetail={(entry, { activeTag, onTagClick, onClose }) => (
          <DetailDialog
            open
            onClose={onClose}
            title={entry.title}
            description={entry.description}
            eyebrow={
              entry.origin === 'user' ? (
                <span className="rounded bg-indigo-50 px-1 py-0.5 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  Custom
                </span>
              ) : undefined
            }
            body={entry.body}
            tags={entry.tags}
            activeTag={activeTag}
            onTagClick={onTagClick}
            source={entry.source}
            actions={
              <>
                {entry.origin === 'user' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onClose()
                        setFormEntry({ entry })
                      }}
                    >
                      <PencilIcon className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        remove(entry.id)
                        onClose()
                      }}
                      className="hover:text-red-600 dark:hover:text-red-400"
                    >
                      <TrashIcon className="size-3.5" />
                      Delete
                    </Button>
                  </>
                )}
                <CopyButton text={entry.body} label="Copy markdown" className="px-3 py-1.5 text-sm" />
              </>
            }
          />
        )}
      />

      {formEntry && (
        <TasteFormDialog
          entry={formEntry.entry}
          tagSuggestions={tagSuggestions}
          onSubmit={handleSubmit}
          onClose={() => setFormEntry(null)}
        />
      )}
    </>
  )
}
