import AsyncStorage from '@react-native-async-storage/async-storage';
import { Market } from '../../domain/entities/Market';
import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { defaultMarkets } from '../seed/defaultMarkets';

const marketsStorageKey = '@lista-mercado-facil:markets';

export class WebMarketRepository implements MarketRepository {
  async getAll(): Promise<Market[]> {
    const markets = await this.readMarkets();

    if (markets.length > 0) {
      return markets;
    }

    await this.writeMarkets(defaultMarkets);
    return defaultMarkets;
  }

  async getById(id: string): Promise<Market | null> {
    const markets = await this.getAll();
    return markets.find((market) => market.id === id) ?? null;
  }

  async save(market: Market): Promise<void> {
    const markets = await this.getAll();
    const exists = markets.some((currentMarket) => currentMarket.id === market.id);
    const nextMarkets = exists
      ? markets.map((currentMarket) => (currentMarket.id === market.id ? market : currentMarket))
      : [...markets, market];

    await this.writeMarkets(nextMarkets);
  }

  async update(market: Market): Promise<void> {
    await this.save(market);
  }

  async delete(id: string): Promise<void> {
    const markets = await this.getAll();
    await this.writeMarkets(markets.filter((market) => market.id !== id));
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
