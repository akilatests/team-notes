import { Module } from '@nestjs/common';
import { McpModule } from '@/mcp/mcp.module';
import { NotesModule } from '@/notes/notes.module';

@Module({
  imports: [NotesModule, McpModule],
})
export class AppModule {}
