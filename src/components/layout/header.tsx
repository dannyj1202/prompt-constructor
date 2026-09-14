import { SearchInput } from '../prompts/search-input'
import { TerminalIcon } from '../ui/icons'

interface HeaderProps {
  query: string
  onQueryChange: (query: string) => void
}

export function Header({ query, onQueryChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <div className="flex shrink-0 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <TerminalIcon className="size-5" strokeWidth={2.5} />
          </span>
          <span className="hidden font-semibold sm:inline">Prompt Constructor</span>
        </div>
        <div className="max-w-xl flex-1">
          <SearchInput value={query} onChange={onQueryChange} />
        </div>
      </div>
    </header>
  )
}
