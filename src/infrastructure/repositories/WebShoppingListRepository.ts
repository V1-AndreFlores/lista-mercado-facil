import AsyncStorage from "@react-native-async-storage/async-storage";
import { ShoppingList } from "../../domain/entities/ShoppingList";
import { ShoppingListItem } from "../../domain/entities/ShoppingListItem";
import { ShoppingListRepository } from "../../domain/repositories/ShoppingListRepository";
import { createId } from "../../shared/utils/createId";

const activeShoppingListStorageKey =
  "@lista-mercado-facil:active-shopping-list";

export class WebShoppingListRepository implements ShoppingListRepository {
  async getActive(): Promise<ShoppingList | null> {
    return this.readActiveList();
  }

  async getById(id: string): Promise<ShoppingList | null> {
    const list = await this.readActiveList();
    return list?.id === id ? list : null;
  }

  async createActive(marketId: string, name: string): Promise<ShoppingList> {
    const now = new Date().toISOString();
    const list: ShoppingList = {
      id: createId(),
      marketId,
      name,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    await this.writeActiveList(list);
    return list;
  }

  async save(list: ShoppingList): Promise<void> {
    await this.writeActiveList(list);
  }

  async update(list: ShoppingList): Promise<void> {
    await this.writeActiveList({
      ...list,
      updatedAt: new Date().toISOString(),
    });
  }

  async addItem(item: ShoppingListItem): Promise<void> {
    const list = await this.readActiveList();

    if (!list) {
      throw new Error("Lista ativa não encontrada.");
    }

    await this.writeActiveList({
      ...list,
      items: [...list.items, item],
      updatedAt: new Date().toISOString(),
    });
  }

  async updateItemPurchaseStatus(
    itemId: string,
    isPurchased: boolean,
  ): Promise<void> {
    const list = await this.readActiveList();

    if (!list) {
      return;
    }

    const now = new Date().toISOString();
    await this.writeActiveList({
      ...list,
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, isPurchased, updatedAt: now } : item,
      ),
      updatedAt: now,
    });
  }

  async updateItemSection(itemId: string, sectionName: string): Promise<void> {
    const list = await this.readActiveList();

    if (!list) {
      return;
    }

    const now = new Date().toISOString();
    await this.writeActiveList({
      ...list,
      items: list.items.map((item) =>
        item.id === itemId ? { ...item, sectionName, updatedAt: now } : item,
      ),
      updatedAt: now,
    });
  }

  async removeItem(itemId: string): Promise<void> {
    const list = await this.readActiveList();

    if (!list) {
      return;
    }

    await this.writeActiveList({
      ...list,
      items: list.items.filter((item) => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    });
  }

  async clearItems(listId: string): Promise<void> {
    const list = await this.readActiveList();

    if (!list || list.id !== listId) {
      return;
    }

    await this.writeActiveList({
      ...list,
      items: [],
      updatedAt: new Date().toISOString(),
    });
  }

  private async readActiveList(): Promise<ShoppingList | null> {
    const rawValue = await AsyncStorage.getItem(activeShoppingListStorageKey);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as ShoppingList;
    } catch {
      await AsyncStorage.removeItem(activeShoppingListStorageKey);
      return null;
    }
  }

  private async writeActiveList(list: ShoppingList): Promise<void> {
    await AsyncStorage.setItem(
      activeShoppingListStorageKey,
      JSON.stringify(list),
    );
  }
}
