import { mkdir, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Plugin } from 'vite'
import { SAVED_PROMPTS_FILE } from './paths.ts'

/** Must match src/lib/mcpSync.ts. */
const ENDPOINT = '/__mcp/saved-prompts'
const MAX_BYTES = 5 * 1024 * 1024

// Requests can overlap (StrictMode runs the startup sync twice) and share one
// temp file, so writes go one at a time, in arrival order.
let writeQueue: Promise<void> = Promise.resolve()

function writeSavedPrompts(data: unknown[]): Promise<void> {
  const result = writeQueue.then(async () => {
    // Write then rename so the MCP server never reads a half-written file.
    await mkdir(dirname(SAVED_PROMPTS_FILE), { recursive: true })
    const tmp = `${SAVED_PROMPTS_FILE}.tmp`
    await writeFile(tmp, JSON.stringify(data, null, 2))
    await rename(tmp, SAVED_PROMPTS_FILE)
  })
  writeQueue = result.catch(() => {})
  return result
}

/**
 * Dev-server endpoint the app PUTs its saved prompts to, so the local MCP
 * server (which can't read browser localStorage) can serve them.
 */
export function mcpSyncPlugin(): Plugin {
  return {
    name: 'prompt-constructor:mcp-sync',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(ENDPOINT, (req, res) => {
        // Requiring JSON forces a CORS preflight for cross-origin callers.
        if (req.method !== 'PUT' || !req.headers['content-type']?.startsWith('application/json')) {
          res.statusCode = 405
          res.end()
          return
        }

        const chunks: Buffer[] = []
        let size = 0
        req.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > MAX_BYTES) {
            res.statusCode = 413
            res.end()
            req.destroy()
          } else {
            chunks.push(chunk)
          }
        })
        req.on('end', async () => {
          if (res.writableEnded) return
          try {
            const data: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
            if (!Array.isArray(data)) throw new Error('Expected an array of saved prompts')
            await writeSavedPrompts(data)
            res.statusCode = 204
          } catch (error) {
            server.config.logger.warn(`[mcp-sync] ${error instanceof Error ? error.message : String(error)}`)
            res.statusCode = 400
          }
          res.end()
        })
      })
    },
  }
}
