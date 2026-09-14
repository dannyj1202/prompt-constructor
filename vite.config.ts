import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { mcpSyncPlugin } from './mcp/vite-plugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), mcpSyncPlugin()],
  // Absolute paths for the MCP config snippets shown in the app.
  define: {
    __MCP_NODE_PATH__: JSON.stringify(process.execPath),
    __MCP_SERVER_PATH__: JSON.stringify(fileURLToPath(new URL('./mcp/server.ts', import.meta.url))),
  },
})
