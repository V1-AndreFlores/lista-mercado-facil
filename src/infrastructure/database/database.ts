import * as SQLite from 'expo-sqlite';
import { databaseSchema } from './schema';
import { seedInitialData } from './seedInitialData';

const databaseName = 'lista_mercado_facil.db';
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(databaseName);
  }

  return databasePromise;
}

export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync(databaseSchema);
  await seedInitialData(database);
}
