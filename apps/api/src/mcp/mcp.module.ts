import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { localhostHostValidation } from '@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js';
import { NotesModule } from '../notes/notes.module';
import { McpController } from './mcp.controller';

@Module({
  imports: [NotesModule],
  controllers: [McpController],
})
export class McpModule implements NestModule {
  // The MCP spec requires DNS-rebinding protection for local servers without auth.
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(localhostHostValidation()).forRoutes(McpController);
  }
}
