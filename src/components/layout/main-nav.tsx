import { cn } from '../../lib/cn'
import { href } from '../../lib/router'

const NAV_ITEMS = [
  { path: '/prompts', label: 'Prompts' },
  { path: '/saved', label: 'Personal' },
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
      {/* Underline tabs sit on the header's bottom rule (-mb-px), so sections read differently from the pill-style filters below.
          On narrow screens the row scrolls, and the fade at the right edge shows there's more. */}
      <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,#000_85%,transparent)]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path, currentPath)
          return (
            <li key={item.path} className="shrink-0">
              <a
                href={href(item.path)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500',
                  'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors',
                  active
                    ? 'text-zinc-900 after:bg-indigo-600 dark:text-zinc-50 dark:after:bg-indigo-400'
                    : 'text-zinc-500 after:bg-transparent hover:text-zinc-900 hover:after:bg-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:after:bg-white/20',
                )}
              >
                {item.label}
                {item.path === '/saved' && savedCount > 0 && (
                  <span className="rounded-full bg-zinc-100 px-1.5 text-xs text-zinc-600 tabular-nums dark:bg-white/[0.08] dark:text-zinc-300">
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
