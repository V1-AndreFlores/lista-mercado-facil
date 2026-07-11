import { ShoppingList } from '../../../domain/entities/ShoppingList';
import { ShoppingListItem } from '../../../domain/entities/ShoppingListItem';

export interface ShoppingListRow {
  id: string;
  market_id: string;
  name: string;
  status?: ShoppingList['status'];
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItemRow {
  id: string;
  list_id: string;
  name: string;
  normalized_name: string;
  quantity: string | number | null;
  unit?: string | null;
  unit_price_cents?: number | null;
  section_name: string;
  category_id?: string | null;
  is_purchased: number;
  created_at: string;
  updated_at: string;
}

export function mapShoppingListRow(
  row: ShoppingListRow,
  itemRows: ShoppingListItemRow[],
): ShoppingList {
  return {
    id: row.id,
    marketId: row.market_id,
    name: row.name,
    status: row.status ?? 'active',
    completedAt: row.completed_at ?? undefined,
    items: itemRows.map(mapShoppingListItemRow),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapShoppingListItemRow(row: ShoppingListItemRow): ShoppingListItem {
  const quantity = Number(row.quantity);
  const unitPriceCents = Number(row.unit_price_cents);
  const item: ShoppingListItem = {
    id: row.id,
    listId: row.list_id,
    name: row.name,
    normalizedName: row.normalized_name,
    quantity: Number.isFinite(quantity) && quantity > 0 ? Math.trunc(quantity) : 1,
    unit: (row.unit || 'un') as ShoppingListItem['unit'],
    sectionName: row.section_name,
    categoryId: row.category_id ?? undefined,
    isPurchased: row.is_purchased === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (Number.isFinite(unitPriceCents) && unitPriceCents > 0) {
    item.unitPriceCents = Math.trunc(unitPriceCents);
  }

  return item;
}
