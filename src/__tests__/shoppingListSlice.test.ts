import shoppingListReducer, {
  addShoppingListItem,
  removeShoppingListItem,
  setActiveList,
  toggleShoppingListItemPurchased,
} from '../app/store/slices/shoppingListSlice';
import { ShoppingList } from '../domain/entities/ShoppingList';
import { ShoppingListItem } from '../domain/entities/ShoppingListItem';

const now = '2026-07-09T00:00:00.000Z';

function createList(): ShoppingList {
  return {
    id: 'list-1',
    marketId: 'market-1',
    name: 'Compra da semana',
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}

function createItem(overrides: Partial<ShoppingListItem> = {}): ShoppingListItem {
  return {
    id: 'item-1',
    listId: 'list-1',
    name: 'banana',
    normalizedName: 'banana',
    sectionName: 'Hortifruti',
    categoryId: 'produce',
    isPurchased: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('shoppingListSlice', () => {
  it('sets the active list', () => {
    const list = createList();

    const state = shoppingListReducer(undefined, setActiveList(list));

    expect(state.activeList?.id).toBe('list-1');
  });

  it('adds an item to the active list', () => {
    const initialState = shoppingListReducer(undefined, setActiveList(createList()));

    const state = shoppingListReducer(initialState, addShoppingListItem(createItem()));

    expect(state.activeList?.items).toHaveLength(1);
    expect(state.activeList?.items[0].name).toBe('banana');
  });

  it('toggles an item as purchased', () => {
    const withList = shoppingListReducer(undefined, setActiveList(createList()));
    const withItem = shoppingListReducer(withList, addShoppingListItem(createItem()));

    const state = shoppingListReducer(withItem, toggleShoppingListItemPurchased('item-1'));

    expect(state.activeList?.items[0].isPurchased).toBe(true);
  });

  it('removes an item from the active list', () => {
    const withList = shoppingListReducer(undefined, setActiveList(createList()));
    const withItem = shoppingListReducer(withList, addShoppingListItem(createItem()));

    const state = shoppingListReducer(withItem, removeShoppingListItem('item-1'));

    expect(state.activeList?.items).toHaveLength(0);
  });
});
