import { href } from '../../lib/router'
import { SearchInput } from '../prompts/search-input'
import { Button } from '../ui/button'
import { PlugIcon, PlusIcon } from '../ui/icons'
import { HeaderLogo } from './header-logo'
import { MainNav } from './main-nav'
import { ThemeToggle } from './theme-toggle'

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
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/75 backdrop-blur-md dark:border-white/[0.07] dark:bg-canvas/80">
      {/* On large screens the first column matches the browse sidebar (15rem), so search starts where the card grid starts. */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)_auto] lg:gap-8">
        <a
          href={href('/prompts')}
          className="flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          <HeaderLogo />
          <span className="hidden text-[15px] font-semibold tracking-[-0.01em] text-zinc-900 md:inline dark:text-zinc-50">
            Prompt Constructor
          </span>
        </a>
        <div className="max-w-xl min-w-0 flex-1">
          <SearchInput value={query} onChange={onQueryChange} placeholder={searchPlaceholder} />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
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
