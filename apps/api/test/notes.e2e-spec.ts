import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Note } from '@team-notes/types';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';

type ErrorBody = { error: { code: string; message: string } };

const USER = 'Maya Okafor';

function bodyOf<T>(response: Response): T {
  return response.body as T;
}

describe('Notes API', () => {
  let app: INestApplication<App>;
  let dbDir: string;

  beforeAll(async () => {
    // A throwaway SQLite file with the real migrations applied.
    dbDir = mkdtempSync(join(tmpdir(), 'team-notes-'));
    const databaseUrl = `file:${join(dbDir, 'test.db')}`;
    process.env.DATABASE_URL = databaseUrl;
    // Jest's process.env does not reach child processes, so pass it explicitly.
    execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'ignore',
    });

    // Imported after DATABASE_URL is set, because PrismaService reads it when constructed.
    const { AppModule } = await import('../src/app.module');
    const { configureApp } = await import('../src/app.setup');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    rmSync(dbDir, { recursive: true, force: true });
  });

  function api(userName: string | null = USER) {
    const agent = request(app.getHttpServer());
    const withUser = <T extends request.Test>(req: T): T =>
      userName === null
        ? req
        : req.set('X-User-Id', encodeURIComponent(userName));
    return {
      search: (q?: string) =>
        withUser(agent.get('/notes').query(q === undefined ? {} : { q })),
      create: (input: object) => withUser(agent.post('/notes').send(input)),
      remove: (id: number | string) => withUser(agent.delete(`/notes/${id}`)),
    };
  }

  async function createNote(input: object, userName = USER): Promise<Note> {
    const response = await api(userName).create(input).expect(201);
    return bodyOf<Note>(response);
  }

  describe('identity', () => {
    it('rejects a request that does not say which user it is for', async () => {
      const response = await api(null).search().expect(401);
      expect(bodyOf<ErrorBody>(response).error.code).toBe('UNAUTHORIZED');
    });

    it('records the decoded user name as the author, including non-Latin names', async () => {
      const note = await createNote({ title: 'Hello' }, '李明');
      expect(note.authorName).toBe('李明');
      expect(note.source).toBe('human');
    });

    it('does not let a REST client claim a note was written by an agent', async () => {
      const response = await api()
        .create({ title: 'Sneaky', source: 'agent' })
        .expect(400);
      expect(bodyOf<ErrorBody>(response).error.message).toContain(
        'source should not exist',
      );
    });
  });

  describe('create validation', () => {
    it('trims the title and tags and defaults the body', async () => {
      const note = await createNote({
        title: '  Q4 plan  ',
        tags: [' launch ', 'q4'],
      });
      expect(note).toMatchObject({
        title: 'Q4 plan',
        body: '',
        tags: ['launch', 'q4'],
      });
    });

    it.each([
      ['a missing title', {}, 'title'],
      ['a blank title', { title: '   ' }, 'title'],
      [
        'duplicate tags ignoring case',
        { title: 'T', tags: ['Launch', 'launch'] },
        'unique',
      ],
      ['a tag with a comma', { title: 'T', tags: ['a,b'] }, 'comma'],
      [
        'more than 10 tags',
        { title: 'T', tags: Array.from({ length: 11 }, (_, i) => `t${i}`) },
        'tags',
      ],
      ['a title over 200 characters', { title: 'x'.repeat(201) }, 'title'],
      ['a tag that is not text', { title: 'T', tags: [5] }, 'string'],
    ])(
      'rejects %s with the shared error shape',
      async (_case, input, messagePart) => {
        const response = await api().create(input).expect(400);
        const { error } = bodyOf<ErrorBody>(response);
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.message).toContain(messagePart);
      },
    );
  });

  it('rejects a request body over the size limit with 413, not a server error', async () => {
    const response = await api()
      .create({ title: 'T', body: 'x'.repeat(200_000) })
      .expect(413);
    expect(bodyOf<ErrorBody>(response).error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  describe('search', () => {
    let roadmap: Note;
    let standup: Note;
    let retro: Note;

    beforeAll(async () => {
      roadmap = await createNote({
        title: 'Roadmap review',
        body: 'Q1 priorities',
      });
      standup = await createNote({
        title: 'Standup',
        body: 'Blocked on staging credentials',
      });
      retro = await createNote({ title: 'Checklist', tags: ['retro'] });
    });

    function idsFor(response: Response): number[] {
      return bodyOf<Note[]>(response).map((note) => note.id);
    }

    it('matches the title, the body or a tag, ignoring case', async () => {
      expect(idsFor(await api().search('ROADMAP'))).toEqual([roadmap.id]);
      expect(idsFor(await api().search('staging'))).toEqual([standup.id]);
      expect(idsFor(await api().search('Retro'))).toEqual([retro.id]);
    });

    it('lists newest first when there is no query', async () => {
      const ids = idsFor(await api().search());
      expect(ids.indexOf(retro.id)).toBeLessThan(ids.indexOf(roadmap.id));
    });

    it('treats SQL wildcard characters as plain text', async () => {
      expect(idsFor(await api().search('%'))).toEqual([]);
      expect(idsFor(await api().search('_'))).toEqual([]);
    });
  });

  describe('delete', () => {
    it('removes the note so it no longer appears in the list', async () => {
      const note = await createNote({ title: 'Temporary' });
      await api().remove(note.id).expect(204);
      const ids = bodyOf<Note[]>(await api().search('Temporary')).map(
        (n) => n.id,
      );
      expect(ids).not.toContain(note.id);
    });

    it('returns 404 for a note that does not exist', async () => {
      const response = await api().remove(999_999).expect(404);
      expect(bodyOf<ErrorBody>(response).error.code).toBe('NOT_FOUND');
    });

    it('returns 400 for an id that is not a number', async () => {
      await api().remove('abc').expect(400);
    });
  });
});
