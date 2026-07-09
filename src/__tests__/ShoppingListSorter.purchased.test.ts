import { ShoppingListSorter } from '../domain/services/ShoppingListSorter';
import { MarketSection } from '../domain/entities/MarketSection';
import { ShoppingListItem } from '../domain/entities/ShoppingListItem';

const marketSections: MarketSection[] = [
  {
    id: 'section-1',
    marketId: 'market-1',
    name: 'Hortifruti',
    routeOrder: 1,
    isActive: true,
  },
];

function createItem(id: string, name: string, isPurchased: boolean): ShoppingListItem {
  return {
    id,
    listId: 'list-1',
    name,
    quantity: 1,
    unit: 'un',
    normalizedName: name,
    sectionName: 'Hortifruti',
    categoryId: 'produce',
    isPurchased,
    createdAt: '2026-07-09T00:00:00.000Z',
    updatedAt: '2026-07-09T00:00:00.000Z',
  };
}

describe('ShoppingListSorter', () => {
  it('keeps purchased items at the end of each section', () => {
    const sorter = new ShoppingListSorter();
    const items = [
      createItem('1', 'banana', true),
      createItem('2', 'abacate', false),
      createItem('3', 'maçã', false),
    ];

    const result = sorter.sortByMarketRoute(items, marketSections);

    expect(result[0].items.map((item) => item.name)).toEqual(['abacate', 'maçã', 'banana']);
  });
});
