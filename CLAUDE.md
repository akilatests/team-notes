
Team notes app. Humans use the React UI, AI agents use the MCP server.
Both go through the same NestJS notes service. Time-boxed: small, polished, finished.
 
## Stack
- apps/api/: NestJS + TypeScript + SQLite + Prisma
- apps/web/: React 19 + TypeScript + Vite + shadcn/ui (Tailwind v4, lucide icons) + Zustand. Use shadcn components, add new ones with `pnpm dlx shadcn@latest add`. src/components/ui is generated: do not hand-edit, and it is excluded from lint
- packages/elements/: Web Components. One for now: <tag-picker> (Shadow DOM, attributes in, custom events out)
- packages/types/: shared TypeScript types (Note etc). Types only, apps/api imports with `import type`
- MCP endpoint at /mcp inside the NestJS app, calling the same notes service

## Scope
In: create, list, search, delete notes. Team notes. One team and many users.
Out: real auth (fake user via X-User-Id header), multiple teams, user permissions, real-time sync.
 
## Core rules
- Write the least code that fully solves the task. No speculative abstractions.
- Keep files and functions small. One responsibility each.
- Match the existing style in the file you are editing.
- If something is unclear, ask. Do not guess and build.

## TypeScript
- strict mode. No `any`. Use `unknown` and narrow it.
- No non-null assertions (`!`) to silence errors. Fix the type.
- No `@ts-ignore` or `eslint-disable` unless I approve it.
- Named exports only. No default exports (except where a tool requires it).
- Shared types live in packages/types (@team-notes/types). Never redefine the Note type.

## Anti-patterns to avoid
- Business logic in controllers or React components. Put it in services/hooks.
- Duplicating logic between REST and MCP. Both call the notes service.
- Swallowing errors (empty catch, catch-and-log-only). Handle or rethrow.
- Floating promises. Always await or explicitly handle.
- Magic strings and numbers. Use constants or enums.
- useEffect for derived state or data that can be computed during render.
- Prop drilling more than two levels. Lift or use context.
- Mutating state or function arguments.
- Commented-out code, console.log, dead code, TODOs without a reason.
- Clever one-liners that are hard to read. Prefer boring and clear.

## API
- Validate all input at the edge (DTOs + class-validator).
- Consistent error shape: { error: { code, message } }.
- Correct HTTP status codes.

## Frontend
- Every data view has loading, empty and error states.
- Fully keyboard usable: visible focus, logical tab order, Enter/Escape work.
- Semantic HTML first. ARIA only when HTML cannot do it.

## MCP
- Follow the latest spec
- Tools: search_notes, create_note. No delete tool for agents.
- Clear tool names and descriptions. Validate inputs with schemas.
- Record that agent-created notes were created by an agent on behalf of a user.
- Auth and destructive actions are a written note in the README, not code. Do not build OAuth, soft delete, confirmations or audit logs.

## README (required deliverable, written in t7)
- Setup steps, key decisions, what I would do with more time, how I used AI tools.
- Auth and destructive actions note, covering:
  - Auth: today a fake X-User-Id header. In production, OAuth 2.1 per the MCP spec, with per-user tokens and scopes (notes:read, notes:write), and agent notes recorded as "agent X on behalf of user Y".
  - Destructive actions: done today, agents get no delete tool. If one is added later: soft delete, human confirmation via MCP elicitation, destructiveHint tool annotation, a notes:delete scope off by default, and an audit log.

## Tests
- Test behaviour, not implementation. Focus on permissions, search, validation.
- Only add meaninful tests
- No tests that only check a 200 status.

## Before saying a task is done
1. Run type check, lint and tests. All must pass.
2. Re-read your diff. Remove anything not needed.
3. Tell me what you skipped and any risks.


# The task goes in multiple commits/steps
- t1: Scaffolding hello world apps with the monorepo setup
- t2: Complete UI implementation. No API. Fake hardcoded data on the frontend
- t3: Implement the tag picker web component
- t4: Build the backend API
- t5: Integrate the API to the frontend
- t6: MCP setup and test
- t7: Further tests, polishing, and the README (including the auth and destructive actions note)

# Original handout (confidential, gitignored)
@TASK.md
