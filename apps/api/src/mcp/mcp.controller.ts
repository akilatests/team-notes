import {
  All,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Request, Response } from 'express';
import { UserName } from '../common/user-name';
import { NotesService } from '../notes/notes.service';
import { createNotesMcpServer } from './notes-mcp-server';

/** MCP over Streamable HTTP, stateless: every POST gets a fresh server and transport. */
@Controller('mcp')
export class McpController {
  constructor(private readonly notes: NotesService) {}

  @Post()
  async handle(
    @Req() req: Request,
    @Res() res: Response,
    @UserName() userName: string,
  ): Promise<void> {
    const server = createNotesMcpServer(this.notes, userName);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  }

  // Stateless: no server-to-client stream (GET) or session to end (DELETE), so the spec says 405.
  @All()
  methodNotAllowed(@Res({ passthrough: true }) res: Response): never {
    res.setHeader('Allow', 'POST');
    throw new HttpException(
      'Use POST for MCP requests',
      HttpStatus.METHOD_NOT_ALLOWED,
    );
  }
}
