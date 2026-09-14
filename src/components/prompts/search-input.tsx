import { useEffect, useRef } from 'react'
import { SearchIcon } from '../ui/icons'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // "/" (like GitHub) or Cmd/Ctrl+K (like Raycast/Linear) focuses search from anywhere.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isCmdK) {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
        return
      }
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="relative w-full">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onChange('')
            event.currentTarget.blur()
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder.replace(/…$/, '')}
        className="h-10 w-full rounded-lg border border-zinc-200 bg-white pr-10 pl-9 text-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900"
      />
      {!value && (
        <div className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 items-center gap-2 sm:flex">
          <kbd className="hidden font-mono text-xs text-zinc-400 lg:inline dark:text-zinc-500">↑↓ or j/k to navigate</kbd>
          <kbd className="rounded border border-zinc-200 px-1.5 font-mono text-[10px] text-zinc-400 dark:border-zinc-700">/</kbd>
        </div>
      )}
    </div>
  )
}
