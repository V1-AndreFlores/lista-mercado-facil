import { MarketRepository } from '../../domain/repositories/MarketRepository';
import { initializeDatabase } from '../database/database';
import { SQLiteMarketRepository } from './SQLiteMarketRepository';

export async function createMarketRepository(): Promise<MarketRepository> {
  await initializeDatabase();
  return new SQLiteMarketRepository();
}
