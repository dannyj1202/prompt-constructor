import { useMemo, useSyncExternalStore } from 'react'

// Minimal hash router: `#/path?key=value`. Hash URLs work from any static
// host and need no server rewrites. Filter state lives in the query string so
// links (e.g. from the Tags page) can open a pre-filtered view.

export interface Route {
  path: string
  params: URLSearchParams
}

type Params = Record<string, string | null | undefined>

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

function getHash() {
  return window.location.hash
}

export function parseHash(hash: string): Route {
  const [rawPath = '', search = ''] = hash.replace(/^#/, '').split('?')
  const path = rawPath.replace(/\/+$/, '') || '/'
  return { path, params: new URLSearchParams(search) }
}

export function useHashRoute(): Route {
  const hash = useSyncExternalStore(subscribe, getHash)
  return useMemo(() => parseHash(hash), [hash])
}

/** Build a hash href, dropping empty params. */
export function href(path: string, params: Params = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const query = search.toString()
  return `#${path}${query ? `?${query}` : ''}`
}

export function navigate(to: string, { replace = false } = {}) {
  if (!replace) {
    window.location.hash = to
    return
  }
  // replaceState doesn't fire hashchange, so notify subscribers ourselves.
  const oldURL = window.location.href
  history.replaceState(history.state, '', to)
  window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: window.location.href }))
}

/** Merge `patch` into the current route's params without adding a history entry. */
export function updateParams(route: Route, patch: Params) {
  navigate(href(route.path, { ...Object.fromEntries(route.params), ...patch }), { replace: true })
}
