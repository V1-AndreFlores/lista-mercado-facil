export interface ShoppingListItem {
  id: string;
  listId: string;
  name: string;
  normalizedName: string;
  quantity?: string;
  sectionName: string;
  categoryId?: string;
  isPurchased: boolean;
  createdAt: string;
  updatedAt: string;
}
