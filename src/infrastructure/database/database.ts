import * as SQLite from 'expo-sqlite';
import { databaseSchema } from './schema';
import { seedInitialData } from './seedInitialData';
import { ensureDatabaseIntegrity } from './databaseIntegrity';

const databaseName = 'lista_mercado_facil.db';
let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initializationPromise: Promise<void> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(databaseName);
  }

  return databasePromise;
}

export function initializeDatabase(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = initializeDatabaseInternal().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

async function initializeDatabaseInternal(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync('PRAGMA foreign_keys = ON;');
  await database.execAsync(databaseSchema);
  await seedInitialData(database);
  await ensureDatabaseIntegrity(database);
}
