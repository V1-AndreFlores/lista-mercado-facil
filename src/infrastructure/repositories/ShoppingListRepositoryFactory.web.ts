import { ShoppingListRepository } from '../../domain/repositories/ShoppingListRepository';
import { WebShoppingListRepository } from './WebShoppingListRepository';

export async function createShoppingListRepository(): Promise<ShoppingListRepository> {
  return new WebShoppingListRepository();
}
