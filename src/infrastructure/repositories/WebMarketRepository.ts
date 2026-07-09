import AsyncStorage from '@react-native-async-storage/async-storage';
import { Market } from '../../domain/entities/Market';
import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { defaultMarkets } from '../seed/defaultMarkets';

const marketsStorageKey = '@lista-mercado-facil:markets';
const activeMarketStorageKey = '@lista-mercado-facil:active-market-id';

export class WebMarketRepository implements MarketRepository {
  async getAll(): Promise<Market[]> {
    const markets = await this.readMarkets();

    if (markets.length > 0) {
      return markets;
    }

    await this.writeMarkets(defaultMarkets);
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
    const exists = markets.some((currentMarket) => currentMarket.id === market.id);
    const nextMarkets = exists
      ? markets.map((currentMarket) => (currentMarket.id === market.id ? market : currentMarket))
      : [...markets, market];

    await this.writeMarkets(nextMarkets);

    const activeMarketId = await this.getActiveMarketId();
    if (!activeMarketId) {
      await this.setActiveMarketId(market.id);
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
