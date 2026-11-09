import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '@/app.module';
import { configureApp } from '@/app.setup';

export type TestApp = {
  app: INestApplication<App>;
  close: () => Promise<void>;
};

export async function createTestApp(): Promise<TestApp> {
  const dbDir = mkdtempSync(join(tmpdir(), 'team-notes-'));
  const databaseUrl = `file:${join(dbDir, 'test.db')}`;
  // PrismaService reads this when the module compiles below.
  process.env.DATABASE_URL = databaseUrl;
  // Jest's process.env does not reach child processes, so pass it explicitly.
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'ignore',
  });

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();

  return {
    app,
    close: async () => {
      await app.close();
      rmSync(dbDir, { recursive: true, force: true });
    },
  };
}
