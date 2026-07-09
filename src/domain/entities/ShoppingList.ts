import { ShoppingListItem } from './ShoppingListItem';

export type ShoppingListStatus = 'active' | 'completed';

export interface ShoppingList {
  id: string;
  marketId: string;
  name: string;
  status: ShoppingListStatus;
  completedAt?: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}
