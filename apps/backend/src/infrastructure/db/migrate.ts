import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const connectionString =
  process.env.DATABASE_URL ?? 'postgres://comune:dev_only@localhost:5432/comune_virtuale_dev';

async function runMigrations() {
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);
  const migrationsFolder = resolve(__dirname, '../../../drizzle');
  console.log(`Running migrations from ${migrationsFolder}...`);
  await migrate(db, { migrationsFolder });
  await client.end();
  console.log('Migrations complete.');
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
