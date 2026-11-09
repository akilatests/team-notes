import type { Note, NoteSource } from '@team-notes/types';
import type { Note as NoteRow } from '@/generated/prisma/client';

const NOTE_SOURCES: readonly NoteSource[] = ['human', 'agent'];

function isNoteSource(value: string): value is NoteSource {
  return NOTE_SOURCES.some((source) => source === value);
}

function parseTags(json: string): string[] {
  const value: unknown = JSON.parse(json);
  if (!Array.isArray(value) || !value.every((tag) => typeof tag === 'string')) {
    throw new Error(`Stored tags are not a string array: ${json}`);
  }
  return value;
}

export function toNote(row: NoteRow): Note {
  if (!isNoteSource(row.source)) {
    throw new Error(
      `Stored note ${row.id} has an unknown source: ${row.source}`,
    );
  }
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    tags: parseTags(row.tags),
    authorName: row.authorName,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
  };
}
