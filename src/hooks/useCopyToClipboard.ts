import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyStatus = 'idle' | 'copied' | 'error'

async function writeToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  // The Clipboard API is unavailable on plain-http origins (e.g. opening the
  // dev server via a LAN IP), so fall back to the legacy copy command.
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  textarea.remove()
  if (!ok) throw new Error('Copy command failed')
}

export function useCopyToClipboard(resetAfterMs = 1500) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const resetTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  const copy = useCallback(
    async (text: string) => {
      window.clearTimeout(resetTimer.current)
      try {
        await writeToClipboard(text)
        setStatus('copied')
      } catch {
        setStatus('error')
      }
      resetTimer.current = window.setTimeout(() => setStatus('idle'), resetAfterMs)
    },
    [resetAfterMs],
  )

  return { status, copy }
}
