import { TASTE_ENTRIES } from '../../data/taste'
import type { Route } from '../../lib/router'
import { TaggedCollectionPage } from '../layout/tagged-collection-page'
import { ContentCard } from '../ui/content-card'
import { CopyButton } from '../ui/copy-button'
import { DetailDialog } from '../ui/detail-dialog'

export function TastePage({ route }: { route: Route }) {
  return (
    <TaggedCollectionPage
      route={route}
      items={TASTE_ENTRIES}
      getKey={(entry) => entry.id}
      searchFields={(entry) => [entry.title, entry.description, entry.body, entry.source]}
      title="Taste"
      description="Coding style and conventions from AGENTS.md and constitution.md. Copy a block into a prompt or agent instructions."
      noun={['entry', 'entries']}
      renderCard={(entry, { activeTag, onTagClick, onOpen }) => (
        <ContentCard
          title={entry.title}
          description={entry.description}
          preview={entry.body}
          tags={entry.tags}
          activeTag={activeTag}
          onTagClick={onTagClick}
          source={entry.source}
          onOpen={onOpen}
          actions={<CopyButton text={entry.body} />}
        />
      )}
      renderDetail={(entry, { activeTag, onTagClick, onClose }) => (
        <DetailDialog
          open
          onClose={onClose}
          title={entry.title}
          description={entry.description}
          body={entry.body}
          tags={entry.tags}
          activeTag={activeTag}
          onTagClick={onTagClick}
          source={entry.source}
          actions={<CopyButton text={entry.body} label="Copy markdown" className="px-3 py-1.5 text-sm" />}
        />
      )}
    />
  )
}
