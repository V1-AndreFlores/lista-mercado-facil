import AsyncStorage from '@react-native-async-storage/async-storage';
import { Market } from '../../domain/entities/Market';
import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { sanitizeAisleNumberInput } from '../../shared/utils/marketSection';
import { defaultMarkets } from '../seed/defaultMarkets';

const marketsStorageKey = '@lista-mercado-facil:markets';
const activeMarketStorageKey = '@lista-mercado-facil:active-market-id';
const marketsVersionStorageKey = '@lista-mercado-facil:markets-version';
const currentMarketsVersion = '2026-07-11-zaffari-fernandes-vieira-corredores-v1';
const zaffariMarketId = 'market-zaffari-fernandes-vieira';

export class WebMarketRepository implements MarketRepository {
  async getAll(): Promise<Market[]> {
    const markets = await this.readMarkets();

    if (markets.length > 0) {
      const migratedMarkets = await this.migrateMarketsIfNeeded(markets);
      return migratedMarkets;
    }

    await this.writeMarkets(defaultMarkets);
    await AsyncStorage.setItem(marketsVersionStorageKey, currentMarketsVersion);
    await this.ensureActiveMarket(defaultMarkets);
    return defaultMarkets;
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
    const nextMarkets = markets.filter((market) => market.id !== id);
    await this.writeMarkets(nextMarkets);

    const activeMarketId = await this.getActiveMarketId();
    if (activeMarketId === id) {
      await AsyncStorage.removeItem(activeMarketStorageKey);
      await this.ensureActiveMarket(nextMarkets);
    }
  }

  private async migrateMarketsIfNeeded(markets: Market[]): Promise<Market[]> {
    const version = await AsyncStorage.getItem(marketsVersionStorageKey);
    const normalizedMarkets = markets.map((market) => this.normalizeMarket(market));

    if (version === currentMarketsVersion) {
      return normalizedMarkets;
    }

    const defaultZaffariMarket = defaultMarkets.find((market) => market.id === zaffariMarketId);

    if (!defaultZaffariMarket) {
      await AsyncStorage.setItem(marketsVersionStorageKey, currentMarketsVersion);
      return normalizedMarkets;
    }

    const migratedMarkets = normalizedMarkets.map((market) => {
      if (market.id !== zaffariMarketId) {
        return market;
      }

      return {
        ...market,
        name: market.name || defaultZaffariMarket.name,
        address: market.address ?? defaultZaffariMarket.address,
        isDefault: market.isDefault ?? true,
        sections: defaultZaffariMarket.sections,
      };
    });

    const hasZaffariMarket = migratedMarkets.some((market) => market.id === zaffariMarketId);
    const nextMarkets = hasZaffariMarket ? migratedMarkets : [defaultZaffariMarket, ...migratedMarkets];

    await this.writeMarkets(nextMarkets);
    await AsyncStorage.setItem(marketsVersionStorageKey, currentMarketsVersion);

    return nextMarkets;
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
      return JSON.parse(rawValue) as Market[];
    } catch {
      await AsyncStorage.removeItem(marketsStorageKey);
      return [];
    }
  }

  private async writeMarkets(markets: Market[]): Promise<void> {
    await AsyncStorage.setItem(marketsStorageKey, JSON.stringify(markets));
  }
}
