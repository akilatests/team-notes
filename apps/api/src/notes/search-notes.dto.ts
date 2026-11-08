import { IsString, MaxLength } from 'class-validator';
import { NOTE_LIMITS } from './note-limits';

export class SearchNotesDto {
  @IsString()
  @MaxLength(NOTE_LIMITS.queryMaxLength)
  q: string = '';
}
