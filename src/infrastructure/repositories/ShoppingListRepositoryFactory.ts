import { ShoppingListRepository } from '../../domain/repositories/ShoppingListRepository';
import { initializeDatabase } from '../database/database';
import { SQLiteShoppingListRepository } from './SQLiteShoppingListRepository';

export async function createShoppingListRepository(): Promise<ShoppingListRepository> {
  await initializeDatabase();
  return new SQLiteShoppingListRepository();
}
