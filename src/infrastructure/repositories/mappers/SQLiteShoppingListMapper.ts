import { ShoppingList } from '../../../domain/entities/ShoppingList';
import { ShoppingListItem } from '../../../domain/entities/ShoppingListItem';

export interface ShoppingListRow {
  id: string;
  market_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItemRow {
  id: string;
  list_id: string;
  name: string;
  normalized_name: string;
  quantity: string | null;
  section_name: string;
  category_id: string | null;
  is_purchased: number;
  created_at: string;
  updated_at: string;
}

export function mapShoppingListItemRow(row: ShoppingListItemRow): ShoppingListItem {
  return {
    id: row.id,
    listId: row.list_id,
    name: row.name,
    normalizedName: row.normalized_name,
    quantity: row.quantity ?? undefined,
    sectionName: row.section_name,
    categoryId: row.category_id ?? undefined,
    isPurchased: row.is_purchased === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapShoppingListRow(row: ShoppingListRow, itemRows: ShoppingListItemRow[]): ShoppingList {
  return {
    id: row.id,
    marketId: row.market_id,
    name: row.name,
    items: itemRows.map(mapShoppingListItemRow),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
