import { SQLiteDatabase } from 'expo-sqlite';
import { defaultCategories } from '../seed/defaultCategories';
import { defaultMarkets } from '../seed/defaultMarkets';

const seedVersionKey = 'seed_version';
const currentSeedVersion = '2026-07-11-sqlite-zaffari-corredores-precos-v2';
const deletedZaffariMarketMetadataKey = 'deleted_zaffari_fernandes_vieira';
const zaffariMarketName = 'Zaffari Fernandes Vieira';
const zaffariMarketId = 'market-zaffari-fernandes-vieira';

export async function seedInitialData(database: SQLiteDatabase): Promise<void> {
  await ensureSeedSchemaMigrations(database);

  const metadata = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_metadata WHERE key = ?',
    [seedVersionKey],
  );

  if (metadata?.value === currentSeedVersion) {
    return;
  }

  const now = new Date().toISOString();

  for (const category of defaultCategories) {
    await database.runAsync(
      `INSERT OR IGNORE INTO product_categories
       (id, name, default_section_name, keywords_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category.id, category.name, category.defaultSectionName, JSON.stringify(category.keywords), now, now],
    );
  }

  const deletedZaffariMetadata = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
    [deletedZaffariMarketMetadataKey],
  );
  const wasZaffariDeleted = deletedZaffariMetadata?.value === 'true';

  for (const market of defaultMarkets) {
    if (isZaffariFernandesVieira(market) && wasZaffariDeleted) {
      continue;
    }

    if (isZaffariFernandesVieira(market)) {
      await upsertCanonicalZaffariMarket(database, market, now);
      continue;
    }

    await database.runAsync(
      `INSERT OR IGNORE INTO markets
       (id, name, address, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [market.id, market.name, market.address ?? null, market.isDefault ? 1 : 0, now, now],
    );

    for (const section of market.sections) {
      await database.runAsync(
        `INSERT OR IGNORE INTO market_sections
         (id, market_id, name, aisle_number, route_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          section.id,
          section.marketId,
          section.name,
          sanitizeAisleNumber(section.aisleNumber) || null,
          section.routeOrder,
          section.isActive ? 1 : 0,
          now,
          now,
        ],
      );
    }
  }

  await database.runAsync(
    `INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)`,
    [seedVersionKey, currentSeedVersion],
  );
}

async function upsertCanonicalZaffariMarket(
  database: SQLiteDatabase,
  market: (typeof defaultMarkets)[number],
  now: string,
): Promise<void> {
  const existingRows = await database.getAllAsync<{ id: string }>(
    `SELECT id
     FROM markets
     WHERE id = ? OR lower(trim(name)) = lower(trim(?))`,
    [zaffariMarketId, zaffariMarketName],
  );

  const targetMarketIds = existingRows.length > 0
    ? existingRows.map((row) => row.id)
    : [market.id];

  for (const marketId of targetMarketIds) {
    await database.runAsync(
      `INSERT INTO markets (id, name, address, is_default, created_at, updated_at)
       VALUES (?, ?, NULL, 1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         address = NULL,
         is_default = 1,
         updated_at = excluded.updated_at`,
      [marketId, market.name, now, now],
    );

    await database.runAsync('DELETE FROM market_sections WHERE market_id = ?', [marketId]);

    for (const section of market.sections) {
      const sectionId = marketId === market.id ? section.id : `${marketId}-${section.id}`;

      await database.runAsync(
        `INSERT INTO market_sections
         (id, market_id, name, aisle_number, route_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sectionId,
          marketId,
          section.name,
          sanitizeAisleNumber(section.aisleNumber) || null,
          section.routeOrder,
          section.isActive ? 1 : 0,
          now,
          now,
        ],
      );
    }
  }
}

async function ensureSeedSchemaMigrations(database: SQLiteDatabase): Promise<void> {
  try {
    await database.runAsync('ALTER TABLE market_sections ADD COLUMN aisle_number TEXT NULL');
  } catch {
    // Column already exists.
  }

  try {
    await database.runAsync('ALTER TABLE shopping_list_items ADD COLUMN unit_price_cents INTEGER NULL');
  } catch {
    // Column already exists.
  }
}

function isZaffariFernandesVieira(market: Pick<(typeof defaultMarkets)[number], 'id' | 'name'>): boolean {
  return market.id === zaffariMarketId || normalizeText(market.name) === normalizeText(zaffariMarketName);
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function sanitizeAisleNumber(value: string | undefined): string | undefined {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 2);
  return digits || undefined;
}
