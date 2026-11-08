// Types only: apps/api compiles to CommonJS and can only consume this via `import type`.

export type NoteSource = 'human' | 'agent';

export interface Note {
  id: number;
  title: string;
  body: string;
  tags: string[];
  authorName: string;
  // 'agent' means an AI agent created it on behalf of authorName.
  source: NoteSource;
  // ISO 8601
  createdAt: string;
}

export type CreateNoteInput = Pick<Note, 'title' | 'body' | 'tags'>;
