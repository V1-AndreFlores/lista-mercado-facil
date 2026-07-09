import { ShoppingList } from "../../../domain/entities/ShoppingList";
import { ShoppingListItem, ShoppingListItemUnit, shoppingListItemUnits } from "../../../domain/entities/ShoppingListItem";

export interface ShoppingListRow {
  id: string;
  market_id: string;
  name: string;
  status?: string | null;
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
    quantity: parsePersistedQuantity(row.quantity),
    unit: parsePersistedUnit(row.unit),
    sectionName: row.section_name,
    categoryId: row.category_id ?? undefined,
    isPurchased: row.is_purchased === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapShoppingListRow(
  row: ShoppingListRow,
  itemRows: ShoppingListItemRow[],
): ShoppingList {
  const status = row.status === "completed" ? "completed" : "active";

  return {
    id: row.id,
    marketId: row.market_id,
    name: row.name,
    status,
    completedAt: row.completed_at ?? undefined,
    items: itemRows.map(mapShoppingListItemRow),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parsePersistedQuantity(value: string | number | null): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.replace(",", "."));

    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      return parsedValue;
    }
  }

  return 1;
}

function parsePersistedUnit(value?: string | null): ShoppingListItemUnit {
  return shoppingListItemUnits.includes(value as ShoppingListItemUnit)
    ? (value as ShoppingListItemUnit)
    : "un";
}
