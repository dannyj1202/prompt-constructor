import type { MiddlewareHandler } from 'hono'

// The API has no auth, so it only answers requests that come from this machine's own app.
// CORS alone isn't enough: it hides responses from other sites, but a "simple" cross-site
// request (e.g. a text/plain POST from any web page you visit) still runs and changes data.

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1'])

/** http://localhost or http://127.0.0.1 on any port (Vite takes the next free port if 5173 is busy). */
export function isLocalOrigin(origin: string): boolean {
  try {
    const url = new URL(origin)
    return url.protocol === 'http:' && LOCAL_HOSTNAMES.has(url.hostname)
  } catch {
    // Includes `Origin: null` (sandboxed iframes, file:// pages).
    return false
  }
}

export const localOnly: MiddlewareHandler = async (c, next) => {
  // DNS rebinding: a hostile domain that resolves to 127.0.0.1 still sends its own name as Host.
  const host = c.req.header('host') ?? new URL(c.req.url).host
  if (!isLocalOrigin(`http://${host}`)) return c.json({ error: 'Forbidden: unexpected Host' }, 403)

  // Browsers always send Origin on cross-site writes; curl and the MCP server send none.
  const origin = c.req.header('origin')
  if (origin !== undefined && !isLocalOrigin(origin)) return c.json({ error: 'Forbidden: cross-site request' }, 403)

  // A JSON body can't be sent cross-site without a CORS preflight, which the CORS config refuses.
  const method = c.req.method
  if ((method === 'POST' || method === 'PUT') && !c.req.header('content-type')?.startsWith('application/json')) {
    return c.json({ error: 'Content-Type must be application/json' }, 415)
  }

  await next()
}
