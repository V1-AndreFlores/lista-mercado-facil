export const shoppingListItemUnits = [
  "un",
  "kg",
  "g",
  "L",
  "ml",
  "pacote",
  "caixa",
  "bandeja",
] as const;

export type ShoppingListItemUnit = (typeof shoppingListItemUnits)[number];

export interface ShoppingListItem {
  id: string;
  listId: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit: ShoppingListItemUnit;
  sectionName: string;
  categoryId?: string;
  isPurchased: boolean;
  createdAt: string;
  updatedAt: string;
}
