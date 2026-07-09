import { ShoppingList } from '../entities/ShoppingList';
import { ShoppingListItem } from '../entities/ShoppingListItem';

export interface ShoppingListRepository {
  getAll(): Promise<ShoppingList[]>;
  getActive(): Promise<ShoppingList | null>;
  getCompleted(): Promise<ShoppingList[]>;
  getById(id: string): Promise<ShoppingList | null>;
  createActive(marketId: string, name: string): Promise<ShoppingList>;
  setActive(listId: string): Promise<ShoppingList | null>;
  save(list: ShoppingList): Promise<void>;
  update(list: ShoppingList): Promise<void>;
  completeList(listId: string): Promise<void>;
  reuseListAsActive(sourceListId: string, name: string): Promise<ShoppingList>;
  addItem(item: ShoppingListItem): Promise<void>;
  updateItemPurchaseStatus(itemId: string, isPurchased: boolean): Promise<void>;
  updateItemSection(itemId: string, sectionName: string): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  clearItems(listId: string): Promise<void>;
}
