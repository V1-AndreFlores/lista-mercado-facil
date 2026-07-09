import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { WebMarketRepository } from './WebMarketRepository';

export async function createMarketRepository(): Promise<MarketRepository> {
  return new WebMarketRepository();
}
