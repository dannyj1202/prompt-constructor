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
      <ul className="-mb-px flex gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path, currentPath)
          return (
            <li key={item.path} className="shrink-0">
              <a
                href={href(item.path)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500',
                  active
                    ? 'border-indigo-600 text-zinc-900 dark:text-zinc-100'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100',
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
