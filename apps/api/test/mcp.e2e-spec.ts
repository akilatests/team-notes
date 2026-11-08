import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Note } from '@team-notes/types';
import request from 'supertest';
import { createTestApp, TestApp } from './test-app';

const USER = '李明';

function noteOf(result: unknown): Note {
  const [first] = CallToolResultSchema.parse(result).content;
  if (first?.type !== 'text') throw new Error('Expected a text result');
  return JSON.parse(first.text) as Note;
}

function notesOf(result: unknown): Note[] {
  const [first] = CallToolResultSchema.parse(result).content;
  if (first?.type !== 'text') throw new Error('Expected a text result');
  return JSON.parse(first.text) as Note[];
}

async function connectAs(baseUrl: string, user: string): Promise<Client> {
  const client = new Client({ name: 'e2e-test', version: '1.0.0' });
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`), {
      requestInit: { headers: { 'X-User-Id': encodeURIComponent(user) } },
    }),
  );
  return client;
}

describe('MCP server', () => {
  let testApp: TestApp;
  let baseUrl: string;
  let client: Client;

  beforeAll(async () => {
    testApp = await createTestApp();
    await testApp.app.listen(0, '127.0.0.1');
    baseUrl = await testApp.app.getUrl();
    client = await connectAs(baseUrl, USER);
  });

  afterAll(async () => {
    await client.close();
    await testApp.close();
  });

  it('offers exactly search_notes and create_note, with no delete tool', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name).sort()).toEqual([
      'create_note',
      'search_notes',
    ]);
    expect(
      tools.find((tool) => tool.name === 'search_notes')?.annotations
        ?.readOnlyHint,
    ).toBe(true);
  });

  it('records a created note as written by an agent on behalf of the connected user', async () => {
    const note = noteOf(
      await client.callTool({
        name: 'create_note',
        arguments: { title: '  Agent summary  ', tags: ['agents'] },
      }),
    );
    expect(note).toMatchObject({
      title: 'Agent summary',
      body: '',
      authorName: USER,
      source: 'agent',
    });

    const found = notesOf(
      await client.callTool({
        name: 'search_notes',
        arguments: { query: 'agent summary' },
      }),
    );
    expect(found.map((n) => n.id)).toEqual([note.id]);
  });

  it('keeps overlapping requests from different users apart', async () => {
    const other = await connectAs(baseUrl, 'Maya');
    try {
      const [mine, theirs] = await Promise.all([
        client.callTool({
          name: 'create_note',
          arguments: { title: 'Overlap mine' },
        }),
        other.callTool({
          name: 'create_note',
          arguments: { title: 'Overlap theirs' },
        }),
      ]);
      expect(noteOf(mine)).toMatchObject({
        title: 'Overlap mine',
        authorName: USER,
      });
      expect(noteOf(theirs)).toMatchObject({
        title: 'Overlap theirs',
        authorName: 'Maya',
      });
    } finally {
      await other.close();
    }
  });

  it('returns invalid input as a tool error and creates nothing', async () => {
    const result = await client.callTool({
      name: 'create_note',
      arguments: { title: '   ', tags: ['a', 'A'] },
    });
    expect(result.isError).toBe(true);

    const all = notesOf(
      await client.callTool({ name: 'search_notes', arguments: {} }),
    );
    expect(all.every((note) => note.title.trim() !== '')).toBe(true);
  });

  describe('HTTP rules', () => {
    const initialize = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 't', version: '1' },
      },
    };

    it('rejects a request that does not say which user the agent acts for', async () => {
      await request(testApp.app.getHttpServer())
        .post('/mcp')
        .set('Accept', 'application/json, text/event-stream')
        .send(initialize)
        .expect(401);
    });

    it('rejects a non-localhost Host header (DNS-rebinding protection)', async () => {
      await request(testApp.app.getHttpServer())
        .post('/mcp')
        .set('Host', 'evil.example')
        .set('X-User-Id', 'Maya')
        .set('Accept', 'application/json, text/event-stream')
        .send(initialize)
        .expect(403);
    });

    it('answers GET with 405, since this stateless server has no event stream', async () => {
      const response = await request(testApp.app.getHttpServer())
        .get('/mcp')
        .set('X-User-Id', 'Maya')
        .expect(405);
      expect(response.headers.allow).toBe('POST');
    });
  });
});
