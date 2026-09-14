import { useEffect, useRef, useState } from 'react'

interface UseGridKeyboardNavOptions<T> {
  items: T[]
  onOpen: (item: T) => void
  onCopy: (item: T) => void
  /**
   * Called when arrow/j-k navigation lands on a new item, so real DOM focus
   * can follow the visual highlight for keyboard/AT parity. Skipped while the
   * keypress came from the search box, so typing-then-arrowing never steals
   * focus away from it.
   */
  onNavigate?: (item: T) => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function isSearchBox(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && target.type === 'search'
}

/**
 * Raycast/Linear-style grid navigation: Arrow keys (or j/k outside text
 * fields) move a highlight, Enter opens the highlighted item, and c or
 * Cmd/Ctrl+C copies it. Arrow keys and Enter still work while the header
 * search box has focus, so typing a query and picking a result is one motion.
 */
export function useGridKeyboardNav<T>({ items, onOpen, onCopy, onNavigate }: UseGridKeyboardNavOptions<T>) {
  const [rawIndex, setRawIndex] = useState(-1)
  // Derived, not stored: a new filter can shrink the list out from under a stale index.
  const activeIndex = rawIndex >= 0 && rawIndex < items.length ? rawIndex : -1

  // Read through a ref instead of listing these in the effect's deps: callers
  // (App.tsx's action handlers, this page's inline onCopy) recreate them every
  // render, which would otherwise detach/reattach the listener on every keystroke.
  const latest = useRef({ items, activeIndex, onOpen, onCopy, onNavigate })
  useEffect(() => {
    latest.current = { items, activeIndex, onOpen, onCopy, onNavigate }
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const { items, activeIndex, onOpen, onCopy, onNavigate } = latest.current
      if (items.length === 0) return
      const typing = isTypingTarget(event.target)
      const canNavigate = !typing || isSearchBox(event.target)
      // Real focus follows the highlight only outside the search box, so
      // typing-then-arrowing never steals focus away from it.
      const shouldMoveFocus = !isSearchBox(event.target)

      if (canNavigate && (event.key === 'ArrowDown' || (!typing && event.key === 'j'))) {
        event.preventDefault()
        const nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % items.length
        setRawIndex(nextIndex)
        if (shouldMoveFocus) onNavigate?.(items[nextIndex])
        return
      }
      if (canNavigate && (event.key === 'ArrowUp' || (!typing && event.key === 'k'))) {
        event.preventDefault()
        const nextIndex = activeIndex < 0 ? items.length - 1 : (activeIndex - 1 + items.length) % items.length
        setRawIndex(nextIndex)
        if (shouldMoveFocus) onNavigate?.(items[nextIndex])
        return
      }
      if (canNavigate && event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault()
        onOpen(items[activeIndex])
        return
      }
      if (!typing && event.key.toLowerCase() === 'c' && activeIndex >= 0) {
        event.preventDefault()
        onCopy(items[activeIndex])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return { activeIndex }
}
