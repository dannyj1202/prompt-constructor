import { cn } from '../../lib/cn'
import { href } from '../../lib/router'

const NAV_ITEMS = [
  { path: '/prompts', label: 'Prompts' },
  { path: '/saved', label: 'Saved' },
  { path: '/workflows', label: 'Workflows' },
  { path: '/skills', label: 'Skills' },
  { path: '/taste', label: 'Taste' },
  { path: '/tags', label: 'Tags' },
]

function isActive(itemPath: string, currentPath: string) {
  if (itemPath === '/prompts' && currentPath === '/') return true
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

interface MainNavProps {
  currentPath: string
  savedCount: number
}

export function MainNav({ currentPath, savedCount }: MainNavProps) {
  return (
    <nav aria-label="Main">
      <ul className="flex gap-1 overflow-x-auto py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path, currentPath)
          return (
            <li key={item.path} className="shrink-0">
              <a
                href={href(item.path)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500',
                  active
                    ? 'bg-zinc-200/80 text-zinc-900 dark:bg-white/10 dark:text-zinc-100'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-zinc-100',
                )}
              >
                {item.label}
                {item.path === '/saved' && savedCount > 0 && (
                  <span className="rounded-full bg-zinc-100 px-1.5 text-xs text-zinc-600 tabular-nums dark:bg-zinc-800 dark:text-zinc-300">
                    {savedCount}
                  </span>
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
