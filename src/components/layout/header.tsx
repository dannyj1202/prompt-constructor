import { href } from '../../lib/router'
import { SearchInput } from '../prompts/search-input'
import { Button } from '../ui/button'
import { PlugIcon, PlusIcon, TerminalIcon } from '../ui/icons'
import { MainNav } from './main-nav'

interface HeaderProps {
  currentPath: string
  query: string
  onQueryChange: (query: string) => void
  searchPlaceholder: string
  savedCount: number
  onCreatePrompt: () => void
  onOpenMcp: () => void
}

export function Header({
  currentPath,
  query,
  onQueryChange,
  searchPlaceholder,
  savedCount,
  onCreatePrompt,
  onOpenMcp,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-canvas/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <a href={href('/prompts')} className="flex shrink-0 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <TerminalIcon className="size-5" strokeWidth={2.5} />
          </span>
          <span className="hidden font-semibold md:inline">Prompt Constructor</span>
        </a>
        <div className="max-w-xl min-w-0 flex-1">
          <SearchInput value={query} onChange={onQueryChange} placeholder={searchPlaceholder} />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button onClick={onOpenMcp} aria-label="MCP server config" title="MCP server config">
            <PlugIcon className="size-4" />
            <span className="hidden sm:inline">MCP</span>
          </Button>
          <Button variant="primary" onClick={onCreatePrompt} aria-label="Create Prompt">
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Create Prompt</span>
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4">
        <MainNav currentPath={currentPath} savedCount={savedCount} />
      </div>
    </header>
  )
}
