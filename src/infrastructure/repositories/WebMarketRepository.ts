import AsyncStorage from '@react-native-async-storage/async-storage';
import { Market } from '../../domain/entities/Market';
import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { sanitizeAisleNumberInput } from '../../shared/utils/marketSection';
import { defaultMarkets } from '../seed/defaultMarkets';

const marketsStorageKey = '@lista-mercado-facil:markets';
const activeMarketStorageKey = '@lista-mercado-facil:active-market-id';
const marketsVersionStorageKey = '@lista-mercado-facil:markets-version';
const currentMarketsVersion = '2026-07-11-zaffari-fernandes-vieira-corredores-v7';
const zaffariMarketId = 'market-zaffari-fernandes-vieira';
const deletedZaffariMarketStorageKey = '@lista-mercado-facil:deleted-zaffari-market';

export class WebMarketRepository implements MarketRepository {
  async getAll(): Promise<Market[]> {
    const storedMarkets = await this.readMarkets();

    if (storedMarkets.length > 0) {
      const normalizedMarkets = storedMarkets.map((market) => this.normalizeMarket(market));
      const migratedMarkets = await this.applyMandatoryMarketMigrations(normalizedMarkets);

      await AsyncStorage.setItem(marketsVersionStorageKey, currentMarketsVersion);
      return migratedMarkets;
    }

    const initialMarkets = defaultMarkets.map((market) => this.normalizeMarket(market));
    await this.writeMarkets(initialMarkets);
    await AsyncStorage.setItem(marketsVersionStorageKey, currentMarketsVersion);
    await this.ensureActiveMarket(initialMarkets);
    return initialMarkets;
  }

  async getById(id: string): Promise<Market | null> {
    const markets = await this.getAll();
    return markets.find((market) => market.id === id) ?? null;
  }

  async getActiveMarketId(): Promise<string | null> {
    const markets = await this.getAll();
    const storedId = await AsyncStorage.getItem(activeMarketStorageKey);

    if (storedId && markets.some((market) => market.id === storedId)) {
      return storedId;
    }

    return this.ensureActiveMarket(markets);
  }

  async setActiveMarketId(id: string): Promise<void> {
    const markets = await this.getAll();
    const exists = markets.some((market) => market.id === id);

    if (!exists) {
      throw new Error('Supermercado não encontrado.');
    }

    await AsyncStorage.setItem(activeMarketStorageKey, id);
  }

  async save(market: Market): Promise<void> {
    const markets = await this.getAll();
    const normalizedMarket = this.normalizeMarket(market);
    const exists = markets.some((currentMarket) => currentMarket.id === normalizedMarket.id);
    const nextMarkets = exists
      ? markets.map((currentMarket) => (currentMarket.id === normalizedMarket.id ? normalizedMarket : currentMarket))
      : [...markets, normalizedMarket];

    if (this.isZaffariFernandesVieira(normalizedMarket)) {
      await AsyncStorage.removeItem(deletedZaffariMarketStorageKey);
    }

    await this.writeMarkets(nextMarkets);

    const activeMarketId = await this.getActiveMarketId();
    if (!activeMarketId) {
      await this.setActiveMarketId(normalizedMarket.id);
    }
  }

  async update(market: Market): Promise<void> {
    await this.save(market);
  }

  async delete(id: string): Promise<void> {
    const markets = await this.getAll();
    const marketToDelete = markets.find((market) => market.id === id) ?? null;
    const nextMarkets = markets.filter((market) => market.id !== id);

    if (marketToDelete && this.isZaffariFernandesVieira(marketToDelete)) {
      await AsyncStorage.setItem(deletedZaffariMarketStorageKey, 'true');
    }

    await this.writeMarkets(nextMarkets);

    const storedActiveMarketId = await AsyncStorage.getItem(activeMarketStorageKey);
    if (storedActiveMarketId === id) {
      await AsyncStorage.removeItem(activeMarketStorageKey);
      await this.ensureActiveMarket(nextMarkets);
    }
  }

  private async applyMandatoryMarketMigrations(markets: Market[]): Promise<Market[]> {
    const defaultZaffariMarket = defaultMarkets.find((market) => this.isZaffariFernandesVieira(market));
    const wasZaffariDeleted = (await AsyncStorage.getItem(deletedZaffariMarketStorageKey)) === 'true';

    if (!defaultZaffariMarket) {
      await this.writeMarkets(markets);
      return markets;
    }

    let hasZaffariMarket = false;

    const nextMarkets = markets.map((market) => {
      if (!this.isZaffariFernandesVieira(market)) {
        return market;
      }

      hasZaffariMarket = true;
      return this.createCanonicalZaffariMarket(market, defaultZaffariMarket);
    });

    const migratedMarkets = hasZaffariMarket || wasZaffariDeleted
      ? nextMarkets
      : [defaultZaffariMarket, ...nextMarkets];

    await this.writeMarkets(migratedMarkets);
    return migratedMarkets;
  }

  private createCanonicalZaffariMarket(currentMarket: Market, defaultZaffariMarket: Market): Market {
    return this.normalizeMarket({
      id: currentMarket.id,
      name: defaultZaffariMarket.name,
      isDefault: true,
      sections: defaultZaffariMarket.sections.map((section) => ({
        ...section,
        marketId: currentMarket.id,
      })),
      createdAt: (currentMarket as Market & { createdAt?: string }).createdAt,
      updatedAt: new Date().toISOString(),
    } as Market & { createdAt?: string; updatedAt?: string });
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

  private normalizeMarket(market: Market): Market {
    return {
      ...market,
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

  private async ensureActiveMarket(markets: Market[]): Promise<string | null> {
    const fallbackMarket = markets.find((market) => market.isDefault) ?? markets[0] ?? null;

    if (!fallbackMarket) {
      await AsyncStorage.removeItem(activeMarketStorageKey);
      return null;
    }

    await AsyncStorage.setItem(activeMarketStorageKey, fallbackMarket.id);
    return fallbackMarket.id;
  }

  private async readMarkets(): Promise<Market[]> {
    const rawValue = await AsyncStorage.getItem(marketsStorageKey);

    if (!rawValue) {
      return [];
    }

    try {
      const parsedMarkets = JSON.parse(rawValue) as Market[];
      return Array.isArray(parsedMarkets) ? parsedMarkets : [];
    } catch {
      await AsyncStorage.removeItem(marketsStorageKey);
      return [];
    }
  }

  private async writeMarkets(markets: Market[]): Promise<void> {
    await AsyncStorage.setItem(marketsStorageKey, JSON.stringify(markets));
  }
}
