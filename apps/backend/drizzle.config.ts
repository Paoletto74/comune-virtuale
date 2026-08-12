import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://comune:dev_only@localhost:5432/comune_virtuale_dev',
  },
});
