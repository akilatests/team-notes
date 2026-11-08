// shortcut: assumes the API runs on localhost:3000 next to the browser; make it configurable when deployed.
export const MCP_URL = 'http://localhost:3000/mcp'

const SERVER_NAME = 'team-notes'
const USER_HEADER = 'X-User-Id'
const JSON_INDENT = 2

export type Snippet = {
  label: string
  code: string
}

export type AgentClient = {
  id: string
  name: string
  steps: string
  snippets: Snippet[]
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, JSON_INDENT)
}

export function agentClients(userName: string): AgentClient[] {
  const userId = encodeURIComponent(userName)
  const header = `${USER_HEADER}: ${userId}`
  const headers = { [USER_HEADER]: userId }

  return [
    {
      id: 'claude-code',
      name: 'Claude Code',
      steps: 'Run in a terminal.',
      snippets: [
        {
          label: 'Terminal',
          code: `claude mcp add --transport http ${SERVER_NAME} ${MCP_URL} --header "${header}"`,
        },
      ],
    },
    {
      id: 'claude-desktop',
      name: 'Claude Desktop',
      steps: 'In Claude Desktop open Settings, Developer, Edit Config. Paste this in, then restart. Needs Node.js.',
      snippets: [
        {
          label: 'claude_desktop_config.json',
          code: toJson({
            mcpServers: {
              [SERVER_NAME]: {
                command: 'npx',
                args: ['-y', 'mcp-remote', MCP_URL, '--header', `${USER_HEADER}:${userId}`],
              },
            },
          }),
        },
      ],
    },
    {
      id: 'codex',
      name: 'Codex',
      steps: 'Add this to your Codex config, then restart Codex.',
      snippets: [
        {
          label: '~/.codex/config.toml',
          code: [
            `[mcp_servers.${SERVER_NAME}]`,
            `url = "${MCP_URL}"`,
            `http_headers = { "${USER_HEADER}" = "${userId}" }`,
          ].join('\n'),
        },
      ],
    },
    {
      id: 'vscode',
      name: 'VS Code',
      steps: 'Add this to your project, then select Start above the server in that file.',
      snippets: [
        {
          label: '.vscode/mcp.json',
          code: toJson({ servers: { [SERVER_NAME]: { type: 'http', url: MCP_URL, headers } } }),
        },
      ],
    },
    {
      id: 'gemini-cli',
      name: 'Gemini CLI',
      steps: 'Run in a terminal.',
      snippets: [
        {
          label: 'Terminal',
          code: `gemini mcp add --transport http ${SERVER_NAME} ${MCP_URL} --header "${header}"`,
        },
      ],
    },
    {
      id: 'windsurf',
      name: 'Windsurf',
      steps: 'Add this to your Windsurf config, then refresh the MCP servers in Cascade.',
      snippets: [
        {
          label: '~/.codeium/windsurf/mcp_config.json',
          code: toJson({ mcpServers: { [SERVER_NAME]: { serverUrl: MCP_URL, headers } } }),
        },
      ],
    },
    {
      id: 'other',
      name: 'Other MCP client',
      steps: 'Any client that supports Streamable HTTP and custom headers.',
      snippets: [
        { label: 'Server URL', code: MCP_URL },
        { label: 'Header', code: header },
      ],
    },
  ]
}
