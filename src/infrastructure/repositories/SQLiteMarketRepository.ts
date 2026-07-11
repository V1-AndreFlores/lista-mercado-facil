import { Market } from '../../domain/entities/Market';
import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { sanitizeAisleNumberInput } from '../../shared/utils/marketSection';
import { defaultMarkets } from '../seed/defaultMarkets';
import { getDatabase } from '../database/database';

const activeMarketMetadataKey = 'active_market_id';
const deletedZaffariMarketMetadataKey = 'deleted_zaffari_fernandes_vieira';
const zaffariMarketId = 'market-zaffari-fernandes-vieira';

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
  aisle_number: string | null;
  route_order: number;
  is_active: number;
}

export class SQLiteMarketRepository implements MarketRepository {
  async getAll(): Promise<Market[]> {
    await this.ensureMarketSchema();
    await this.applyMandatoryMarketMigrations();
    return this.readMarkets();
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
      await database.runAsync('DELETE FROM app_metadata WHERE key = ?', [activeMarketMetadataKey]);
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
    await this.ensureMarketSchema();
    await this.upsertMarket(this.normalizeMarket(market));

    if (this.isZaffariFernandesVieira(market)) {
      const database = await getDatabase();
      await database.runAsync('DELETE FROM app_metadata WHERE key = ?', [deletedZaffariMarketMetadataKey]);
    }

    const activeMarketId = await this.getActiveMarketId();
    if (!activeMarketId) {
      await this.setActiveMarketId(market.id);
    }
  }

  async update(market: Market): Promise<void> {
    await this.save(market);
  }

  async delete(id: string): Promise<void> {
    await this.ensureMarketSchema();
    const database = await getDatabase();
    const marketToDelete = await this.getById(id);

    if (marketToDelete && this.isZaffariFernandesVieira(marketToDelete)) {
      await database.runAsync(
        `INSERT OR REPLACE INTO app_metadata (key, value)
         VALUES (?, ?)`,
        [deletedZaffariMarketMetadataKey, 'true'],
      );
    }

    await database.runAsync('DELETE FROM markets WHERE id = ?', [id]);

    const storedActiveMarket = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
      [activeMarketMetadataKey],
    );

    if (storedActiveMarket?.value === id) {
      await database.runAsync('DELETE FROM app_metadata WHERE key = ?', [activeMarketMetadataKey]);
      const fallbackMarket = (await this.readMarkets())[0] ?? null;

      if (fallbackMarket) {
        await this.setActiveMarketId(fallbackMarket.id);
      }
    }
  }

  private async readMarkets(): Promise<Market[]> {
    const database = await getDatabase();

    const marketRows = await database.getAllAsync<MarketRow>(
      'SELECT id, name, address, is_default FROM markets ORDER BY is_default DESC, name ASC',
    );

    const result: Market[] = [];

    for (const marketRow of marketRows) {
      const sectionRows = await database.getAllAsync<MarketSectionRow>(
        `SELECT id, market_id, name, aisle_number, route_order, is_active
         FROM market_sections
         WHERE market_id = ?
         ORDER BY route_order ASC`,
        [marketRow.id],
      );

      result.push(this.normalizeMarket({
        id: marketRow.id,
        name: marketRow.name,
        address: marketRow.address ?? undefined,
        isDefault: marketRow.is_default === 1,
        sections: sectionRows.map((sectionRow) => ({
          id: sectionRow.id,
          marketId: sectionRow.market_id,
          name: sectionRow.name,
          aisleNumber: sanitizeAisleNumberInput(sectionRow.aisle_number ?? undefined),
          routeOrder: sectionRow.route_order,
          isActive: sectionRow.is_active === 1,
        })),
      }));
    }

    return result;
  }

  private async applyMandatoryMarketMigrations(): Promise<void> {
    const database = await getDatabase();
    const defaultZaffariMarket = defaultMarkets.find((market) => this.isZaffariFernandesVieira(market));

    if (!defaultZaffariMarket) {
      return;
    }

    const deletedZaffariMetadata = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_metadata WHERE key = ? LIMIT 1',
      [deletedZaffariMarketMetadataKey],
    );

    if (deletedZaffariMetadata?.value === 'true') {
      return;
    }

    const markets = await this.readMarkets();
    const existingZaffariMarkets = markets.filter((market) => this.isZaffariFernandesVieira(market));

    if (existingZaffariMarkets.length === 0) {
      await this.upsertMarket(this.normalizeMarket(defaultZaffariMarket));
      return;
    }

    for (const market of existingZaffariMarkets) {
      await this.upsertMarket(this.createCanonicalZaffariMarket(market, defaultZaffariMarket));
    }
  }

  private createCanonicalZaffariMarket(currentMarket: Market, defaultZaffariMarket: Market): Market {
    return this.normalizeMarket({
      ...currentMarket,
      name: defaultZaffariMarket.name,
      address: undefined,
      isDefault: true,
      sections: defaultZaffariMarket.sections.map((section) => ({
        ...section,
        id: currentMarket.id === defaultZaffariMarket.id ? section.id : `${currentMarket.id}-${section.id}`,
        marketId: currentMarket.id,
      })),
    });
  }

  private async upsertMarket(market: Market): Promise<void> {
    const database = await getDatabase();
    const now = new Date().toISOString();
    const normalizedMarket = this.normalizeMarket(market);

    await database.runAsync(
      `INSERT INTO markets (id, name, address, is_default, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         address = excluded.address,
         is_default = excluded.is_default,
         updated_at = excluded.updated_at`,
      [
        normalizedMarket.id,
        normalizedMarket.name,
        normalizedMarket.address ?? null,
        normalizedMarket.isDefault ? 1 : 0,
        now,
        now,
      ],
    );

    await database.runAsync('DELETE FROM market_sections WHERE market_id = ?', [normalizedMarket.id]);

    for (const section of normalizedMarket.sections) {
      await database.runAsync(
        `INSERT INTO market_sections
         (id, market_id, name, aisle_number, route_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          section.id,
          normalizedMarket.id,
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

  private normalizeMarket(market: Market): Market {
    return {
      ...market,
      address: this.isZaffariFernandesVieira(market) ? undefined : market.address,
      sections: [...market.sections]
        .filter((section) => Boolean(section.name?.trim()))
        .sort((left, right) => left.routeOrder - right.routeOrder)
        .map((section, index) => ({
          ...section,
          marketId: section.marketId || market.id,
          name: section.name.trim().replace(/\s+/g, ' '),
          aisleNumber: sanitizeAisleNumberInput(section.aisleNumber),
          routeOrder: index + 1,
          isActive: section.isActive !== false,
        })),
    };
  }

  private isZaffariFernandesVieira(market: Pick<Market, 'id' | 'name'>): boolean {
    return market.id === zaffariMarketId
      || this.normalizeText(market.name) === this.normalizeText('Zaffari Fernandes Vieira');
  }

  private normalizeText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  private async ensureMarketSchema(): Promise<void> {
    const database = await getDatabase();

    try {
      await database.runAsync('ALTER TABLE market_sections ADD COLUMN aisle_number TEXT NULL');
    } catch {
      // Column already exists.
    }
  }
}
