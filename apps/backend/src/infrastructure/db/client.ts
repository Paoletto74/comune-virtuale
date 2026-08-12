import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type Database = ReturnType<typeof createDatabase>['db'];

export function createDatabase(connectionString: string) {
  const client = postgres(connectionString, { max: 10 });
  const db = drizzle(client, { schema });
  return { db, client };
}

export { schema };
