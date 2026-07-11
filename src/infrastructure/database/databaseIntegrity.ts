import { SQLiteDatabase } from 'expo-sqlite';
import { defaultMarkets } from '../seed/defaultMarkets';
import { Market } from '../../domain/entities/Market';
import { sanitizeAisleNumberInput } from '../../shared/utils/marketSection';

const activeMarketMetadataKey = 'active_market_id';
const sqliteIntegrityVersionKey = 'sqlite_integrity_version';
const currentSqliteIntegrityVersion = '2026-07-11-sqlite-integrity-v1';
const zaffariMarketName = 'Zaffari Fernandes Vieira';
const zaffariMarketId = 'market-zaffari-fernandes-vieira';

export async function ensureDatabaseIntegrity(database: SQLiteDatabase): Promise<void> {
  await ensureSchemaMigrations(database);
  await ensureCanonicalZaffariMarket(database);
  await ensureActiveMarket(database);

  await database.runAsync(
    'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
    [sqliteIntegrityVersionKey, currentSqliteIntegrityVersion],
  );
}

async function ensureSchemaMigrations(database: SQLiteDatabase): Promise<void> {
  await tryRun(database, 'ALTER TABLE market_sections ADD COLUMN aisle_number TEXT NULL');
  await tryRun(database, 'ALTER TABLE shopping_list_items ADD COLUMN unit_price_cents INTEGER NULL');
  await tryRun(database, "ALTER TABLE shopping_lists ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
  await tryRun(database, 'ALTER TABLE shopping_lists ADD COLUMN completed_at TEXT NULL');
  await tryRun(database, "ALTER TABLE shopping_list_items ADD COLUMN unit TEXT NOT NULL DEFAULT 'un'");

  await database.runAsync("UPDATE shopping_lists SET status = 'active' WHERE status IS NULL OR status = ''");
  await database.runAsync("UPDATE shopping_list_items SET quantity = '1' WHERE quantity IS NULL OR quantity = ''");
}

async function ensureCanonicalZaffariMarket(database: SQLiteDatabase): Promise<void> {
  const defaultZaffariMarket = defaultMarkets.find(isZaffariMarket) ?? defaultMarkets[0];

  if (!defaultZaffariMarket) {
    return;
  }

  const now = new Date().toISOString();
  const marketRows = await database.getAllAsync<{ id: string; name: string }>(
    'SELECT id, name FROM markets',
  );

  const zaffariRows = marketRows.filter((marketRow) => isZaffariIdentifier(marketRow.id, marketRow.name));

  if (zaffariRows.length === 0) {
    await upsertMarket(database, defaultZaffariMarket, defaultZaffariMarket.id, now);
    await replaceMarketSections(database, defaultZaffariMarket, defaultZaffariMarket.id, now);
    return;
  }

  for (const zaffariRow of zaffariRows) {
    await upsertMarket(database, defaultZaffariMarket, zaffariRow.id, now);
    await replaceMarketSections(database, defaultZaffariMarket, zaffariRow.id, now);
  }
}

async function upsertMarket(
  database: SQLiteDatabase,
  defaultMarket: Market,
  marketId: string,
  now: string,
): Promise<void> {
  await database.runAsync(
    `INSERT OR IGNORE INTO markets
     (id, name, address, is_default, created_at, updated_at)
     VALUES (?, ?, NULL, 1, ?, ?)`,
    [marketId, defaultMarket.name, now, now],
  );

  await database.runAsync(
    `UPDATE markets
     SET name = ?, address = NULL, is_default = 1, updated_at = ?
     WHERE id = ?`,
    [defaultMarket.name, now, marketId],
  );
}

async function replaceMarketSections(
  database: SQLiteDatabase,
  defaultMarket: Market,
  marketId: string,
  now: string,
): Promise<void> {
  await database.runAsync('DELETE FROM market_sections WHERE market_id = ?', [marketId]);

  for (const section of [...defaultMarket.sections].sort((left, right) => left.routeOrder - right.routeOrder)) {
    await database.runAsync(
      `INSERT INTO market_sections
       (id, market_id, name, aisle_number, route_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        `${marketId}-${section.id}`,
        marketId,
        section.name,
        sanitizeAisleNumberInput(section.aisleNumber) || null,
        section.routeOrder,
        section.isActive !== false ? 1 : 0,
        now,
        now,
      ],
    );
  }
}

async function ensureActiveMarket(database: SQLiteDatabase): Promise<void> {
  const metadata = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [activeMarketMetadataKey],
  );

  if (metadata?.value) {
    const activeMarket = await database.getFirstAsync<{ id: string }>(
      'SELECT id FROM markets WHERE id = ? LIMIT 1',
      [metadata.value],
    );

    if (activeMarket) {
      return;
    }
  }

  const fallbackMarket = await database.getFirstAsync<{ id: string }>(
    'SELECT id FROM markets ORDER BY is_default DESC, name ASC LIMIT 1',
  );

  if (!fallbackMarket) {
    return;
  }

  await database.runAsync(
    'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)',
    [activeMarketMetadataKey, fallbackMarket.id],
  );
}

function isZaffariMarket(market: Pick<Market, 'id' | 'name'>): boolean {
  return isZaffariIdentifier(market.id, market.name);
}

function isZaffariIdentifier(id: string, name: string): boolean {
  return id === zaffariMarketId || normalizeText(name) === normalizeText(zaffariMarketName);
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

async function tryRun(database: SQLiteDatabase, sql: string): Promise<void> {
  try {
    await database.runAsync(sql);
  } catch {
    // Column already exists or migration is not applicable to this local database version.
  }
}
