import { Market } from '../../domain/entities/Market';
import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { getDatabase } from '../database/database';

const activeMarketMetadataKey = 'active_market_id';

interface MarketRow {
  id: string;
  name: string;
  address: string | null;
  is_default: number;
}

interface MarketSectionRow {
  id: string;
  market_id: string;
  name: string;
  route_order: number;
  is_active: number;
}

export class SQLiteMarketRepository implements MarketRepository {
  async getAll(): Promise<Market[]> {
    const database = await getDatabase();

    const marketRows = await database.getAllAsync<MarketRow>(
      'SELECT id, name, address, is_default FROM markets ORDER BY is_default DESC, name ASC',
    );

    const result: Market[] = [];

    for (const marketRow of marketRows) {
      const sectionRows = await database.getAllAsync<MarketSectionRow>(
        `SELECT id, market_id, name, route_order, is_active
         FROM market_sections
         WHERE market_id = ?
         ORDER BY route_order ASC`,
        [marketRow.id],
      );

      result.push({
        id: marketRow.id,
        name: marketRow.name,
        address: marketRow.address ?? undefined,
        isDefault: marketRow.is_default === 1,
        sections: sectionRows.map((sectionRow) => ({
          id: sectionRow.id,
          marketId: sectionRow.market_id,
          name: sectionRow.name,
          routeOrder: sectionRow.route_order,
          isActive: sectionRow.is_active === 1,
        })),
      });
    }

    return result;
  }

  async getById(id: string): Promise<Market | null> {
    const markets = await this.getAll();
    return markets.find((market) => market.id === id) ?? null;
  }

  async getActiveMarketId(): Promise<string | null> {
    const database = await getDatabase();
    const metadata = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
      [activeMarketMetadataKey],
    );

    const markets = await this.getAll();

    if (metadata?.value && markets.some((market) => market.id === metadata.value)) {
      return metadata.value;
    }

    const fallbackMarket = markets.find((market) => market.isDefault) ?? markets[0] ?? null;

    if (!fallbackMarket) {
      return null;
    }

    await this.setActiveMarketId(fallbackMarket.id);
    return fallbackMarket.id;
  }

  async setActiveMarketId(id: string): Promise<void> {
    const database = await getDatabase();
    const market = await this.getById(id);

    if (!market) {
      throw new Error('Supermercado não encontrado.');
    }

    await database.runAsync(
      `INSERT OR REPLACE INTO app_metadata (key, value)
       VALUES (?, ?)`,
      [activeMarketMetadataKey, id],
    );
  }

  async save(market: Market): Promise<void> {
    const database = await getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `INSERT INTO markets (id, name, address, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [market.id, market.name, market.address ?? null, market.isDefault ? 1 : 0, now, now],
    );

    for (const section of market.sections) {
      await database.runAsync(
        `INSERT INTO market_sections (id, market_id, name, route_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [section.id, market.id, section.name, section.routeOrder, section.isActive ? 1 : 0, now, now],
      );
    }
  }

  async update(market: Market): Promise<void> {
    const database = await getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `UPDATE markets SET name = ?, address = ?, is_default = ?, updated_at = ? WHERE id = ?`,
      [market.name, market.address ?? null, market.isDefault ? 1 : 0, now, market.id],
    );

    for (const section of market.sections) {
      await database.runAsync(
        `UPDATE market_sections
         SET name = ?, route_order = ?, is_active = ?, updated_at = ?
         WHERE id = ? AND market_id = ?`,
        [section.name, section.routeOrder, section.isActive ? 1 : 0, now, section.id, market.id],
      );
    }
  }

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM markets WHERE id = ?', [id]);

    const activeMarketId = await this.getActiveMarketId();
    if (activeMarketId === id) {
      const fallbackMarket = (await this.getAll())[0] ?? null;
      if (fallbackMarket) {
        await this.setActiveMarketId(fallbackMarket.id);
      }
    }
  }
}
