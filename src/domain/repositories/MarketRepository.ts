import { Market } from '../entities/Market';

export interface MarketRepository {
  getAll(): Promise<Market[]>;
  getById(id: string): Promise<Market | null>;
  getActiveMarketId(): Promise<string | null>;
  setActiveMarketId(id: string): Promise<void>;
  save(market: Market): Promise<void>;
  update(market: Market): Promise<void>;
  delete(id: string): Promise<void>;
}
