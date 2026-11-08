// Shared by prisma.config.ts (CLI) and PrismaService (runtime). Relative to apps/api, where every script runs.
const DEFAULT_DATABASE_URL = 'file:./prisma/dev.db';

export function databaseUrl(): string {
  return process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
}
