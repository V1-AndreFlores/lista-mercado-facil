import { isProductAlreadyInList } from '../domain/services/ShoppingListDuplicateGuard';
import { ShoppingListItem } from '../domain/entities/ShoppingListItem';

const now = '2026-07-09T00:00:00.000Z';

function createItem(overrides: Partial<ShoppingListItem> = {}): ShoppingListItem {
  return {
    id: 'item-1',
    listId: 'list-1',
    name: 'Leite',
    quantity: 1,
    unit: 'un',
    normalizedName: 'leite',
    sectionName: 'Frios e laticínios',
    categoryId: 'dairy',
    isPurchased: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('ShoppingListDuplicateGuard', () => {
  it('detects duplicate products ignoring case, accents and extra spaces', () => {
    const items = [createItem({ name: 'Leite', normalizedName: 'leite' })];

    expect(isProductAlreadyInList(items, '  LEÍTE  ')).toBe(true);
  });

  it('detects duplicate products even when the existing item is already purchased', () => {
    const items = [createItem({ isPurchased: true })];

    expect(isProductAlreadyInList(items, 'leite')).toBe(true);
  });

  it('does not flag a different product as duplicate', () => {
    const items = [createItem()];

    expect(isProductAlreadyInList(items, 'banana')).toBe(false);
  });
});
