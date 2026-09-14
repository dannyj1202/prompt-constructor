import type { UserPrompt } from '../types/prompt'

/** Must match the endpoint in mcp/vite-plugin.ts. */
const MCP_SYNC_ENDPOINT = '/__mcp/saved-prompts'

/**
 * Mirror saved prompts to `mcp/.data/saved-prompts.json` (via the dev-server
 * plugin) so the local MCP server can serve them. localStorage stays the
 * source of truth; this is best-effort and a no-op in production builds.
 */
export function syncSavedPromptsToMcp(prompts: UserPrompt[]): void {
  if (!import.meta.env.DEV) return
  fetch(MCP_SYNC_ENDPOINT, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompts),
  }).catch(() => {})
}
