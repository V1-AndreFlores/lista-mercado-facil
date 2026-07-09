import { ShoppingList } from '../entities/ShoppingList';

export interface ShoppingListRepository {
  getActive(): Promise<ShoppingList | null>;
  getById(id: string): Promise<ShoppingList | null>;
  save(list: ShoppingList): Promise<void>;
  update(list: ShoppingList): Promise<void>;
}
