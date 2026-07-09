import { ShoppingListSorter } from '../domain/services/ShoppingListSorter';
import { ShoppingListItem } from '../domain/entities/ShoppingListItem';
import { defaultMarkets } from '../infrastructure/seed/defaultMarkets';

function createItem(name: string, sectionName: string): ShoppingListItem {
  const now = new Date().toISOString();

  return {
    id: name,
    listId: 'list-1',
    name,
    normalizedName: name.toLowerCase(),
    sectionName,
    isPurchased: false,
    createdAt: now,
    updatedAt: now,
  };
}

describe('ShoppingListSorter', () => {
  it('deve ordenar os grupos conforme a rota do supermercado', () => {
    const sorter = new ShoppingListSorter();
    const market = defaultMarkets[0];
    const items = [
      createItem('Café', 'Mercearia'),
      createItem('Banana', 'Hortifruti'),
      createItem('Leite', 'Frios e laticínios'),
    ];

    const result = sorter.sortByMarketRoute(items, market.sections);

    expect(result.map((section) => section.sectionName)).toEqual([
      'Hortifruti',
      'Frios e laticínios',
      'Mercearia',
    ]);
  });
});
