import {
  ShoppingListItemRow,
  ShoppingListRow,
  mapShoppingListRow,
} from '../infrastructure/repositories/mappers/SQLiteShoppingListMapper';

const listRow: ShoppingListRow = {
  id: 'list-1',
  market_id: 'market-1',
  name: 'Compra da semana',
  status: 'active',
  completed_at: null,
  created_at: '2026-07-09T00:00:00.000Z',
  updated_at: '2026-07-09T00:00:00.000Z',
};

const itemRows: ShoppingListItemRow[] = [
  {
    id: 'item-1',
    list_id: 'list-1',
    name: 'Leite',
    normalized_name: 'leite',
    quantity: null,
    section_name: 'Frios e laticínios',
    category_id: 'dairy',
    is_purchased: 1,
    created_at: '2026-07-09T00:00:00.000Z',
    updated_at: '2026-07-09T00:00:00.000Z',
  },
];

describe('SQLiteShoppingListMapper', () => {
  it('maps a persisted active shopping list with its items', () => {
    const list = mapShoppingListRow(listRow, itemRows);

    expect(list.id).toBe('list-1');
    expect(list.marketId).toBe('market-1');
    expect(list.items).toHaveLength(1);
    expect(list.items[0].normalizedName).toBe('leite');
    expect(list.items[0].isPurchased).toBe(true);
  });
});
