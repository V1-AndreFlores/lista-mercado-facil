import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingList } from '../../domain/entities/ShoppingList';
import { ShoppingListItem } from '../../domain/entities/ShoppingListItem';
import { ShoppingListRepository } from '../../domain/repositories/ShoppingListRepository';
import { createId } from '../../shared/utils/createId';
import { resolveShoppingListName } from '../../domain/constants/shoppingListDefaults';

const shoppingListsStorageKey = '@lista-mercado-facil:shopping-lists';
const activeShoppingListIdStorageKey = '@lista-mercado-facil:active-shopping-list-id';
const legacyActiveShoppingListStorageKey = '@lista-mercado-facil:active-shopping-list';

export class WebShoppingListRepository implements ShoppingListRepository {
  async getAll(): Promise<ShoppingList[]> {
    return this.readLists();
  }

  async getActive(): Promise<ShoppingList | null> {
    const [lists, activeId] = await Promise.all([
      this.readLists(),
      AsyncStorage.getItem(activeShoppingListIdStorageKey),
    ]);

    const activeList = activeId
      ? lists.find((list) => list.id === activeId && list.status !== 'completed')
      : null;

    return activeList ?? lists.find((list) => list.status !== 'completed') ?? null;
  }

  async getCompleted(): Promise<ShoppingList[]> {
    const lists = await this.readLists();
    return lists
      .filter((list) => list.status === 'completed')
      .sort((left, right) => (right.completedAt ?? right.updatedAt).localeCompare(left.completedAt ?? left.updatedAt));
  }

  async getById(id: string): Promise<ShoppingList | null> {
    const lists = await this.readLists();
    return lists.find((list) => list.id === id) ?? null;
  }

  async createActive(marketId: string, name: string): Promise<ShoppingList> {
    const now = new Date().toISOString();
    const list: ShoppingList = {
      id: createId(),
      marketId,
      name: resolveShoppingListName(name),
      status: 'active',
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    const lists = await this.readLists();
    await this.writeLists([...lists, list]);
    await AsyncStorage.setItem(activeShoppingListIdStorageKey, list.id);

    return list;
  }

  async setActive(listId: string): Promise<ShoppingList | null> {
    const list = await this.getById(listId);

    if (!list || list.status === 'completed') {
      return null;
    }

    await AsyncStorage.setItem(activeShoppingListIdStorageKey, list.id);
    return list;
  }

  async save(list: ShoppingList): Promise<void> {
    const lists = await this.readLists();
    const exists = lists.some((currentList) => currentList.id === list.id);
    const normalizedList = this.normalizeList(list);

    await this.writeLists(
      exists
        ? lists.map((currentList) => (currentList.id === list.id ? normalizedList : currentList))
        : [...lists, normalizedList],
    );

    if (normalizedList.status !== 'completed') {
      await AsyncStorage.setItem(activeShoppingListIdStorageKey, normalizedList.id);
    }
  }

  async update(list: ShoppingList): Promise<void> {
    const lists = await this.readLists();
    const now = new Date().toISOString();
    const updatedList = this.normalizeList({
      ...list,
      updatedAt: now,
    });

    await this.writeLists(
      lists.map((currentList) => (currentList.id === updatedList.id ? updatedList : currentList)),
    );
  }

  async completeList(listId: string): Promise<void> {
    const lists = await this.readLists();
    const now = new Date().toISOString();

    await this.writeLists(
      lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              status: 'completed',
              completedAt: now,
              updatedAt: now,
            }
          : list,
      ),
    );

    const activeId = await AsyncStorage.getItem(activeShoppingListIdStorageKey);
    if (activeId === listId) {
      await AsyncStorage.removeItem(activeShoppingListIdStorageKey);
    }
  }

  async reuseListAsActive(sourceListId: string, name: string): Promise<ShoppingList> {
    const sourceList = await this.getById(sourceListId);

    if (!sourceList) {
      throw new Error('Lista de origem não encontrada.');
    }

    const now = new Date().toISOString();
    const listId = createId();
    const reusedList: ShoppingList = {
      id: listId,
      marketId: sourceList.marketId,
      name: resolveShoppingListName(name),
      status: 'active',
      items: sourceList.items.map((item) => ({
        ...item,
        id: createId(),
        listId,
        isPurchased: false,
        createdAt: now,
        updatedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    };

    const lists = await this.readLists();
    await this.writeLists([...lists, reusedList]);
    await AsyncStorage.setItem(activeShoppingListIdStorageKey, reusedList.id);

    return reusedList;
  }

  async addItem(item: ShoppingListItem): Promise<void> {
    const lists = await this.readLists();
    const now = new Date().toISOString();

    await this.writeLists(
      lists.map((list) =>
        list.id === item.listId
          ? {
              ...list,
              items: [...list.items, item],
              updatedAt: now,
            }
          : list,
      ),
    );
  }

  async updateItemPurchaseStatus(itemId: string, isPurchased: boolean): Promise<void> {
    await this.updateItem(itemId, (item, now) => ({
      ...item,
      isPurchased,
      updatedAt: now,
    }));
  }

  async updateItemSection(itemId: string, sectionName: string): Promise<void> {
    await this.updateItem(itemId, (item, now) => ({
      ...item,
      sectionName,
      updatedAt: now,
    }));
  }

  async updateItemQuantityAndUnit(itemId: string, quantity: number, unit: string): Promise<void> {
    await this.updateItem(itemId, (item, now) => ({
      ...item,
      quantity: quantity > 0 ? quantity : 1,
      unit: (unit || 'un') as ShoppingListItem['unit'],
      updatedAt: now,
    }));
  }

  async removeItem(itemId: string): Promise<void> {
    const lists = await this.readLists();
    const now = new Date().toISOString();

    await this.writeLists(
      lists.map((list) => {
        const hasItem = list.items.some((item) => item.id === itemId);

        if (!hasItem) {
          return list;
        }

        return {
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
          updatedAt: now,
        };
      }),
    );
  }

  async clearItems(listId: string): Promise<void> {
    const lists = await this.readLists();
    const now = new Date().toISOString();

    await this.writeLists(
      lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [],
              updatedAt: now,
            }
          : list,
      ),
    );
  }

  private async updateItem(
    itemId: string,
    mapItem: (item: ShoppingListItem, now: string) => ShoppingListItem,
  ): Promise<void> {
    const lists = await this.readLists();
    const now = new Date().toISOString();

    await this.writeLists(
      lists.map((list) => {
        const hasItem = list.items.some((item) => item.id === itemId);

        if (!hasItem) {
          return list;
        }

        return {
          ...list,
          items: list.items.map((item) => (item.id === itemId ? mapItem(item, now) : item)),
          updatedAt: now,
        };
      }),
    );
  }

  private async readLists(): Promise<ShoppingList[]> {
    const rawValue = await AsyncStorage.getItem(shoppingListsStorageKey);

    if (rawValue) {
      try {
        const parsedLists = JSON.parse(rawValue) as ShoppingList[];
        return parsedLists.map((list) => this.normalizeList(list));
      } catch {
        await AsyncStorage.removeItem(shoppingListsStorageKey);
      }
    }

    const legacyRawValue = await AsyncStorage.getItem(legacyActiveShoppingListStorageKey);

    if (!legacyRawValue) {
      return [];
    }

    try {
      const legacyList = this.normalizeList(JSON.parse(legacyRawValue) as ShoppingList);
      await this.writeLists([legacyList]);
      await AsyncStorage.setItem(activeShoppingListIdStorageKey, legacyList.id);
      await AsyncStorage.removeItem(legacyActiveShoppingListStorageKey);
      return [legacyList];
    } catch {
      await AsyncStorage.removeItem(legacyActiveShoppingListStorageKey);
      return [];
    }
  }

  private async writeLists(lists: ShoppingList[]): Promise<void> {
    await AsyncStorage.setItem(shoppingListsStorageKey, JSON.stringify(lists.map((list) => this.normalizeList(list))));
  }

  private normalizeList(list: ShoppingList): ShoppingList {
    return {
      ...list,
      name: resolveShoppingListName(list.name),
      status: list.status ?? 'active',
      items: Array.isArray(list.items)
        ? list.items.map((item) => ({
            ...item,
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
            unit: (item.unit ?? 'un') as ShoppingListItem['unit'],
          }))
        : [],
    };
  }
}
