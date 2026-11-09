# Team Notes

A small team notes app. People use the React UI; AI agents use the MCP server. Both go through the same NestJS notes service.

## What's inside

| Path | What it is |
|---|---|
| `apps/api` | NestJS REST API + MCP endpoint, SQLite via Prisma |
| `apps/web` | React 19 + Vite + shadcn/ui |
| `packages/elements` | `<tag-picker>` Web Component (no framework) |
| `packages/types` | Shared TypeScript types (`Note`, `CreateNoteInput`) |

## Setup

Requirements: Node 22.12+ and pnpm 10.

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173 and enter a name. The SQLite database (`apps/api/prisma/dev.db`) is created and migrated automatically when the API starts.

Checks:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Tests

`pnpm test` runs three test suites:

- API (`apps/api/test`): end-to-end tests against the real app and a temporary SQLite database. A few examples:
  - rejects a request without a user, and records non-Latin names correctly as the author
  - does not let a REST client claim a note was written by an agent
  - rejects invalid input (missing title, duplicate tags, too many tags, too large a body) with the shared error shape
  - search matches title, body and tags, ignoring case, and treats `%` and `_` as plain text
  - delete returns 404 for a missing note
- MCP (`apps/api/test`): uses the official MCP client against the server. It checks that only `search_notes` and `create_note` exist (no delete tool), that agent notes are saved for the connected user, that invalid input comes back as a tool error, and the HTTP rules (401 without a user, 403 for a non-localhost host, 405 for GET).
- Tag picker and web (`packages/elements`, `apps/web`): unit tests for the tag rules (trimming, duplicates, commas, the maximum count) and for the error messages shown in the UI.

## Connect an agent (MCP)

Click Connect an agent in the app header. It shows ready-to-copy setup for Claude Code, Claude Desktop, Codex, VS Code, Gemini CLI, Windsurf and other clients, filled in with your name.

For example, Claude Code:

```bash
claude mcp add --transport http team-notes http://localhost:3000/mcp --header "X-User-Id: Maya%20Okafor"
```

Tools: `search_notes` and `create_note`. There is no delete tool for agents.

## Key decisions

- I kept the scope strict and did not add features the assessment doesn't ask for.
- The database schema is kept simple for the demo. There is no users table and no support for multiple teams, just one table for all notes.
- The application uses a fake identity. There are no accounts or passwords. On first visit you type your name, the browser remembers it, and every request sends it to the API in an `X-User-Id` header. The API uses that name as the author of the notes you create. Agents send the same header from their MCP config.
- Notes created by an agent are marked as such. When an agent creates a note through MCP, it is saved with `source: "agent"` and the name of the user who connected the agent, and the app shows an Agent badge next to the author. The REST API cannot set `source`, so only MCP can create agent notes.
- Some ports are fixed. The web app always runs on 5173 and the tag-picker demo on 5174. If a port is taken, they stop with an error instead of picking another one. The API defaults to 3000. The "Connect an agent" commands always say `http://localhost:3000/mcp`, so if the API runs on another port you have to fix the port in the command.
- The Web Component is a plain `HTMLElement`, with no framework. It takes attributes (`tags`, `label`, `max-tags`, `max-tag-length`) and sends a `tags-change` event. It inherits the app's theme through CSS variables.

## Auth and destructive actions in the MCP server

Auth today is the fake `X-User-Id` header: anyone can claim any name. In production I would use OAuth 2.1 as defined by the MCP spec: the client is sent to an authorization server, the user logs in and approves scopes such as `notes:read` and `notes:write`, and every request carries a bearer token for that user. Agent notes would then be recorded as "agent X on behalf of user Y".

Destructive actions: agents get no delete tool, so they can only search and create. If one were added later:

- soft delete, so a mistake can be undone;
- human confirmation before it runs;
- a separate `notes:delete` scope that is off by default;
- an audit log of who deleted what, and for whom.

## What I'd do with more time

- Real user identity, with OAuth 2.1 for the MCP server
- A full database schema with users, teams, roles and audit logs
- Editing notes, and a seed script with demo notes
- Rich notes with links, formatting, tables and images
- Pagination or infinite scrolling for the notes list
- API versioning
- Docker setup for the apps
- Correct the tag picker's background colour in dark mode
- Center the New note dialog on mobile
- A floating New note button in the bottom right on mobile
- Test "Connect an agent" with clients other than Claude Code
- More testing of the error states in the UI
- Add the Claude skills as regular files instead of symlinks, so the team can adjust the rules later

## How I used AI tools

I built this with Claude Code, working in steps (scaffold, UI on fake data, Web Component, API, integration, MCP, polish).

- A `CLAUDE.md` file set the rules: scope, stack, TypeScript strictness, anti-patterns, and what to check before calling a task done.
- Two custom skills kept the work lean: one for writing the smallest complete change, one for code reviews that list concrete bugs with fixes. I ran reviews after each step and chose which findings to fix.
- The UI design was mocked up first in Claude Design, then implemented with shadcn/ui.
- Claude ran the type checks, lint and tests, and checked the UI in headless Chrome (layout at different widths, error states, keyboard shortcuts).
- I made the product and stack decisions, reviewed the output, and pushed back where it was over-engineered or looked off.

## Notes for reviewers

- `CLAUDE.md` is committed on purpose, so you can see the rules the AI worked under.
- Starting the dev server applies the database migrations automatically. That keeps local setup to one command, but a production deployment would run migrations as a separate, controlled step.
