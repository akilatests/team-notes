import type { CreateNoteInput } from '@team-notes/types';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { NOTE_LIMITS } from '@/notes/note-limits';

const NO_COMMA = /^[^,]*$/;

function trim(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateNoteDto implements CreateNoteInput {
  @Transform(({ value }: { value: unknown }) => trim(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(NOTE_LIMITS.titleMaxLength)
  title: string = '';

  @IsString()
  @MaxLength(NOTE_LIMITS.bodyMaxLength)
  body: string = '';

  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value.map(trim) : value,
  )
  @IsArray()
  @ArrayMaxSize(NOTE_LIMITS.tagsMaxCount)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(NOTE_LIMITS.tagMaxLength, { each: true })
  // Tags are stored and sent comma-separated by the tag picker, so a comma would split one tag in two.
  @Matches(NO_COMMA, {
    each: true,
    message: 'each value in tags must not contain a comma',
  })
  // Runs even when a tag is not text, so guard before lowercasing.
  @ArrayUnique(
    (tag: unknown) => (typeof tag === 'string' ? tag.toLowerCase() : tag),
    {
      message: 'tags must be unique, ignoring case',
    },
  )
  tags: string[] = [];
}
