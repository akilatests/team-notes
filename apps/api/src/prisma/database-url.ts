// Relative to apps/api, where the Prisma CLI and the server both run.
const DEFAULT_DATABASE_URL = 'file:./prisma/dev.db';

export function databaseUrl(): string {
  return process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
}
