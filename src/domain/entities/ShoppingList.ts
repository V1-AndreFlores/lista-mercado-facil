import { ShoppingListItem } from './ShoppingListItem';

export interface ShoppingList {
  id: string;
  marketId: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}
