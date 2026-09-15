import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Kept free of side effects so the MCP server (mcp/server.ts) can find the database
// without opening it read-write the way server/db.ts does.

/** The SQLite file the API writes and the MCP server reads. DB_PATH overrides it, e.g. for tests. */
export const DB_PATH = process.env.DB_PATH
  ? resolve(process.env.DB_PATH)
  : resolve(dirname(fileURLToPath(import.meta.url)), 'data', 'prompt-constructor.db')
