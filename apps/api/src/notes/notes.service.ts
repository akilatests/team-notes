import { Injectable } from '@nestjs/common';
import type { CreateNoteInput, Note, NoteSource } from '@team-notes/types';
import { PrismaService } from '@/prisma/prisma.service';
import { toNote } from '@/notes/note.mapper';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string): Promise<Note[]> {
    const q = query.trim();
    const rows = await this.prisma.note.findMany({
      where: q ? { id: { in: await this.matchingIds(q) } } : undefined,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return rows.map(toNote);
  }

  /**
   * Prisma's `contains` becomes SQL LIKE without escaping, so "%" or "_" would match every note.
   * instr() treats the query as plain text. lower() ignores case for ASCII letters only.
   * shortcut: substring match on the tags JSON text; a Tag table would allow exact tag filters.
   */
  private async matchingIds(q: string): Promise<number[]> {
    const rows = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM "Note"
      WHERE instr(lower(title), lower(${q})) > 0
         OR instr(lower(body), lower(${q})) > 0
         OR instr(lower(tags), lower(${q})) > 0`;
    return rows.map((row) => row.id);
  }

  async create(
    input: CreateNoteInput,
    authorName: string,
    source: NoteSource,
  ): Promise<Note> {
    const row = await this.prisma.note.create({
      data: {
        title: input.title,
        body: input.body,
        tags: JSON.stringify(input.tags),
        authorName,
        source,
      },
    });
    return toNote(row);
  }

  async delete(id: number): Promise<boolean> {
    const { count } = await this.prisma.note.deleteMany({ where: { id } });
    return count > 0;
  }
}
