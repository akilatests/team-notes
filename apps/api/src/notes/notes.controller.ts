import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Note } from '@team-notes/types';
import { UserGuard, UserName } from '../common/user-name';
import { CreateNoteDto } from './create-note.dto';
import { NotesService } from './notes.service';
import { SearchNotesDto } from './search-notes.dto';

@Controller('notes')
@UseGuards(UserGuard)
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  search(@Query() query: SearchNotesDto): Promise<Note[]> {
    return this.notes.search(query.q);
  }

  @Post()
  create(
    @Body() input: CreateNoteDto,
    @UserName() userName: string,
  ): Promise<Note> {
    return this.notes.create(input, userName, 'human');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const deleted = await this.notes.delete(id);
    if (!deleted) throw new NotFoundException(`Note ${id} not found`);
  }
}
