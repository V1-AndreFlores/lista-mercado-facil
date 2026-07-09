import { SQLiteDatabase } from 'expo-sqlite';
import { defaultCategories } from '../seed/defaultCategories';
import { defaultMarkets } from '../seed/defaultMarkets';

const seedVersionKey = 'seed_version';
const currentSeedVersion = '1';

export async function seedInitialData(database: SQLiteDatabase): Promise<void> {
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

  for (const market of defaultMarkets) {
    await database.runAsync(
      `INSERT OR IGNORE INTO markets
       (id, name, address, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [market.id, market.name, market.address ?? null, market.isDefault ? 1 : 0, now, now],
    );

    for (const section of market.sections) {
      await database.runAsync(
        `INSERT OR IGNORE INTO market_sections
         (id, market_id, name, route_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [section.id, section.marketId, section.name, section.routeOrder, section.isActive ? 1 : 0, now, now],
      );
    }
  }

  await database.runAsync(
    `INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)`,
    [seedVersionKey, currentSeedVersion],
  );
}
