import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { NOTE_LIMITS } from '../notes/note-limits';
import { NotesService } from '../notes/notes.service';

const SERVER_INFO = { name: 'team-notes', version: '1.0.0' };

function asJson(value: unknown): CallToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

const tagSchema = z
  .string()
  .trim()
  .min(1)
  .max(NOTE_LIMITS.tagMaxLength)
  .regex(/^[^,]*$/, 'A tag must not contain a comma.');

/** One server per request: the user the agent acts for comes from that request's X-User-Id. */
export function createNotesMcpServer(
  notes: NotesService,
  userName: string,
): McpServer {
  const server = new McpServer(SERVER_INFO);

  server.registerTool(
    'search_notes',
    {
      title: 'Search notes',
      description:
        "Search the team's notes. Matches the query against note titles, bodies and tags, ignoring case. " +
        'Returns matching notes newest first as JSON. Leave the query empty to list all notes.',
      inputSchema: {
        query: z
          .string()
          .max(NOTE_LIMITS.queryMaxLength)
          .default('')
          .describe(
            'Text to look for, e.g. "launch" or "customer calls". Empty lists every note.',
          ),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query }) => asJson(await notes.search(query)),
  );

  server.registerTool(
    'create_note',
    {
      title: 'Create note',
      description:
        "Create a note in the team's shared notes. The note is recorded as created by an agent " +
        `on behalf of the connected user (${userName}). Returns the created note as JSON.`,
      inputSchema: {
        title: z
          .string()
          .trim()
          .min(1)
          .max(NOTE_LIMITS.titleMaxLength)
          .describe('Short title. Required.'),
        body: z
          .string()
          .max(NOTE_LIMITS.bodyMaxLength)
          .default('')
          .describe('Plain-text body.'),
        tags: z
          .array(tagSchema)
          .max(NOTE_LIMITS.tagsMaxCount)
          .refine(
            (tags) =>
              new Set(tags.map((tag) => tag.toLowerCase())).size ===
              tags.length,
            'Tags must be unique, ignoring case.',
          )
          .default([])
          .describe('Short labels such as "launch" or "q4".'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (input) => asJson(await notes.create(input, userName, 'agent')),
  );

  return server;
}
