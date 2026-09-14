export const MCP_SERVER_NAME = 'prompt-constructor'

export interface McpConfigBlock {
  label: string
  /** Where the snippet goes. */
  path?: string
  language: 'json' | 'toml' | 'shell'
  code: string
}

export interface McpClient {
  id: string
  name: string
  blocks: McpConfigBlock[]
  note?: string
}

// Absolute paths so GUI apps (which don't inherit your shell's PATH or nvm
// setup) launch the same Node that runs this project.
const command = __MCP_NODE_PATH__
const args = [__MCP_SERVER_PATH__]

const json = (value: unknown) => JSON.stringify(value, null, 2)
const mcpServersJson = (extra: Record<string, string> = {}) =>
  json({ mcpServers: { [MCP_SERVER_NAME]: { ...extra, command, args } } })

function shellQuote(value: string): string {
  return /^[\w@%+=:,./-]+$/.test(value) ? value : `'${value.replace(/'/g, `'\\''`)}'`
}

export const MCP_CLIENTS: McpClient[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    blocks: [
      {
        label: 'Project config',
        path: '.cursor/mcp.json (or ~/.cursor/mcp.json for every project)',
        language: 'json',
        code: mcpServersJson(),
      },
    ],
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    blocks: [
      { label: 'Project config', path: '.mcp.json', language: 'json', code: mcpServersJson({ type: 'stdio' }) },
      {
        label: 'Or add it from the terminal',
        language: 'shell',
        code: `claude mcp add ${MCP_SERVER_NAME} -- ${[command, ...args].map(shellQuote).join(' ')}`,
      },
    ],
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    blocks: [
      {
        label: 'App config',
        path: '~/Library/Application Support/Claude/claude_desktop_config.json',
        language: 'json',
        code: mcpServersJson(),
      },
    ],
  },
  {
    id: 'vscode',
    name: 'VS Code',
    note: 'VS Code uses a "servers" key, not "mcpServers".',
    blocks: [
      {
        label: 'Workspace config',
        path: '.vscode/mcp.json',
        language: 'json',
        code: json({ servers: { [MCP_SERVER_NAME]: { type: 'stdio', command, args } } }),
      },
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    blocks: [
      { label: 'Global config', path: '~/.codeium/windsurf/mcp_config.json', language: 'json', code: mcpServersJson() },
    ],
  },
  {
    id: 'codex',
    name: 'Codex',
    note: 'Codex reads TOML, not JSON.',
    blocks: [
      {
        label: 'Global config',
        path: '~/.codex/config.toml',
        language: 'toml',
        code: `[mcp_servers.${MCP_SERVER_NAME}]\ncommand = ${JSON.stringify(command)}\nargs = [${args.map((arg) => JSON.stringify(arg)).join(', ')}]`,
      },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    blocks: [
      {
        label: 'User config',
        path: '~/.gemini/settings.json (or .gemini/settings.json per project)',
        language: 'json',
        code: mcpServersJson(),
      },
    ],
  },
]
