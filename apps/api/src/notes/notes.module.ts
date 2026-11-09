import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { NotesController } from '@/notes/notes.controller';
import { NotesService } from '@/notes/notes.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
