import { useId, useState } from 'react'
import { normalizeTag } from '../../lib/search'
import { XIcon } from './icons'

interface TagInputProps {
  id?: string
  value: string[]
  onChange: (tags: string[]) => void
  /** Existing tags offered as autocomplete. */
  suggestions?: string[]
  placeholder?: string
}

/** Multi-tag input: Enter or comma adds, Backspace on an empty draft removes the last tag. */
export function TagInput({ id, value, onChange, suggestions = [], placeholder = 'Add a label…' }: TagInputProps) {
  const [draft, setDraft] = useState('')
  const listId = useId()

  function commit(raw: string) {
    const added = raw.split(',').map(normalizeTag).filter(Boolean)
    const next = [...new Set([...value, ...added])]
    if (next.length !== value.length) onChange(next)
    setDraft('')
  }

  return (
    <div className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-0.5 pr-1 pl-2 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
        >
          #{tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            aria-label={`Remove label ${tag}`}
            className="rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900"
          >
            <XIcon className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        list={listId}
        onChange={(event) => {
          // Typing or pasting a comma commits everything before it.
          const text = event.target.value
          if (text.includes(',')) commit(text)
          else setDraft(text)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit(draft)
          } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => draft && commit(draft)}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-zinc-400"
      />
      <datalist id={listId}>
        {suggestions
          .filter((tag) => !value.includes(tag))
          .map((tag) => (
            <option key={tag} value={tag} />
          ))}
      </datalist>
    </div>
  )
}
