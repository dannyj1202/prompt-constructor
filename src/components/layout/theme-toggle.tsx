import type { ComponentType, SVGProps } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/cn'
import type { ThemePreference } from '../../lib/theme'
import { MonitorIcon, MoonIcon, SunIcon } from '../ui/icons'

const OPTIONS: { value: ThemePreference; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { value: 'light', label: 'Light theme', Icon: SunIcon },
  { value: 'dark', label: 'Dark theme', Icon: MoonIcon },
  { value: 'system', label: 'Match system theme', Icon: MonitorIcon },
]

/** Light / Dark / System switch: a recessed well (like the search field) with the chosen option raised. */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme()

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex shrink-0 items-center rounded-lg border border-zinc-200/80 bg-zinc-100/70 p-0.5 dark:border-white/[0.08] dark:bg-canvas-inset"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPreference(value)}
            aria-pressed={active}
            aria-label={label}
            title={label}
            className={cn(
              'grid size-7 place-items-center rounded-md transition active:translate-y-px',
              'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500',
              active
                ? 'bg-white text-indigo-600 shadow-[0_1px_2px_rgb(24_24_27/0.08)] dark:bg-white/[0.1] dark:text-indigo-400 dark:shadow-none'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
            )}
          >
            <Icon className="size-3.5" />
          </button>
        )
      })}
    </div>
  )
}
