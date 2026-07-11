import { SQLiteDatabase } from 'expo-sqlite';
import { defaultCategories } from '../seed/defaultCategories';
import { defaultMarkets } from '../seed/defaultMarkets';
import { sanitizeAisleNumberInput } from '../../shared/utils/marketSection';

const seedVersionKey = 'seed_version';
const currentSeedVersion = '2026-07-11-sqlite-seed-v2';

export async function seedInitialData(database: SQLiteDatabase): Promise<void> {
  await ensureSeedSchemaColumns(database);

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
      `INSERT OR REPLACE INTO product_categories
       (id, name, default_section_name, keywords_json, created_at, updated_at)
       VALUES (
         ?,
         ?,
         ?,
         ?,
         COALESCE((SELECT created_at FROM product_categories WHERE id = ?), ?),
         ?
       )`,
      [
        category.id,
        category.name,
        category.defaultSectionName,
        JSON.stringify(category.keywords),
        category.id,
        now,
        now,
      ],
    );
  }

  for (const market of defaultMarkets) {
    await database.runAsync(
      `INSERT OR IGNORE INTO markets
       (id, name, address, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [market.id, market.name, market.address ?? null, market.isDefault ? 1 : 0, now, now],
    );

    await database.runAsync(
      `UPDATE markets
       SET name = ?, address = ?, is_default = ?, updated_at = ?
       WHERE id = ?`,
      [market.name, market.address ?? null, market.isDefault ? 1 : 0, now, market.id],
    );

    await database.runAsync('DELETE FROM market_sections WHERE market_id = ?', [market.id]);

    for (const section of market.sections) {
      await database.runAsync(
        `INSERT INTO market_sections
         (id, market_id, name, aisle_number, route_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          section.id,
          market.id,
          section.name,
          sanitizeAisleNumberInput(section.aisleNumber) || null,
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


async function ensureSeedSchemaColumns(database: SQLiteDatabase): Promise<void> {
  await tryRun(database, 'ALTER TABLE market_sections ADD COLUMN aisle_number TEXT NULL');
  await tryRun(database, 'ALTER TABLE shopping_list_items ADD COLUMN unit_price_cents INTEGER NULL');
}

async function tryRun(database: SQLiteDatabase, sql: string): Promise<void> {
  try {
    await database.runAsync(sql);
  } catch {
    // Column already exists.
  }
}
