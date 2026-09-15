import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { MCP_CLIENTS } from '../../data/mcpClients'
import { cn } from '../../lib/cn'
import { CopyButton } from '../ui/copy-button'
import { Modal, ModalFooter, ModalHeader } from '../ui/modal'

/** Mount only while open. */
export function McpConfigDialog({ onClose }: { onClose: () => void }) {
  const titleId = useId()
  const tabsId = useId()
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const active = MCP_CLIENTS[activeIndex]

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = MCP_CLIENTS.length - 1
    const next =
      event.key === 'ArrowRight' ? (activeIndex === last ? 0 : activeIndex + 1)
      : event.key === 'ArrowLeft' ? (activeIndex === 0 ? last : activeIndex - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null
    if (next === null) return
    event.preventDefault()
    setActiveIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <ModalHeader
        titleId={titleId}
        title="Connect via MCP"
        description="Run this library as a local MCP server so your AI tools can use your prompts, skills, and taste entries directly."
        onClose={onClose}
      />

      <div className="border-b border-zinc-200 px-5 dark:border-zinc-800">
        <div role="tablist" aria-label="MCP client" className="-mb-px flex gap-1 overflow-x-auto">
          {MCP_CLIENTS.map((client, index) => (
            <button
              key={client.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              type="button"
              role="tab"
              id={`${tabsId}-tab-${client.id}`}
              aria-selected={index === activeIndex}
              aria-controls={`${tabsId}-panel`}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => setActiveIndex(index)}
              onKeyDown={onTabKeyDown}
              className={cn(
                'shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500',
                index === activeIndex
                  ? 'border-indigo-600 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100',
              )}
            >
              {client.name}
            </button>
          ))}
        </div>
      </div>

      <div
        id={`${tabsId}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-tab-${active.id}`}
        className="space-y-4 overflow-y-auto p-5"
      >
        {active.note && <p className="text-sm text-zinc-600 dark:text-zinc-400">{active.note}</p>}
        {active.blocks.map((block) => (
          <div key={block.label}>
            <div className="mb-1.5 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{block.label}</p>
                {block.path && <code className="font-mono text-xs break-all text-zinc-500">{block.path}</code>}
              </div>
              <CopyButton text={block.code} className="shrink-0" />
            </div>
            <pre className="overflow-x-auto rounded-lg bg-zinc-50 p-4 font-mono text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              {block.code}
            </pre>
          </div>
        ))}
      </div>

      <ModalFooter>
        <p className="text-xs text-zinc-500">
          Exposes built-in prompts, skills, and taste entries, plus the ones you've saved or edited, as MCP prompts and
          resources. <code className="font-mono">{'{{VARIABLES}}'}</code> become prompt arguments. Your own content comes
          from the app's local database, so the app doesn't need to be running. Requires Node 22.18+.
        </p>
      </ModalFooter>
    </Modal>
  )
}
