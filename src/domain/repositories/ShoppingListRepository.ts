import { ShoppingList } from "../entities/ShoppingList";
import { ShoppingListItem } from "../entities/ShoppingListItem";

export interface ShoppingListRepository {
  getActive(): Promise<ShoppingList | null>;
  getById(id: string): Promise<ShoppingList | null>;
  createActive(marketId: string, name: string): Promise<ShoppingList>;
  save(list: ShoppingList): Promise<void>;
  update(list: ShoppingList): Promise<void>;
  addItem(item: ShoppingListItem): Promise<void>;
  updateItemPurchaseStatus(itemId: string, isPurchased: boolean): Promise<void>;
  updateItemSection(itemId: string, sectionName: string): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  clearItems(listId: string): Promise<void>;
}
