import { ShoppingList } from "../../domain/entities/ShoppingList";
import { ShoppingListItem } from "../../domain/entities/ShoppingListItem";
import { ShoppingListRepository } from "../../domain/repositories/ShoppingListRepository";
import { createId } from "../../shared/utils/createId";
import { getDatabase } from "../database/database";
import {
  ShoppingListItemRow,
  ShoppingListRow,
  mapShoppingListRow,
} from "./mappers/SQLiteShoppingListMapper";

export class SQLiteShoppingListRepository implements ShoppingListRepository {
  async getActive(): Promise<ShoppingList | null> {
    const database = await getDatabase();
    const listRow = await database.getFirstAsync<ShoppingListRow>(
      `SELECT id, market_id, name, created_at, updated_at
       FROM shopping_lists
       WHERE is_active = 1
       ORDER BY updated_at DESC
       LIMIT 1`,
    );

    if (!listRow) {
      return null;
    }

    return this.getById(listRow.id);
  }

  async getById(id: string): Promise<ShoppingList | null> {
    const database = await getDatabase();
    const listRow = await database.getFirstAsync<ShoppingListRow>(
      `SELECT id, market_id, name, created_at, updated_at
       FROM shopping_lists
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    if (!listRow) {
      return null;
    }

    const itemRows = await this.getItemRows(id);
    return mapShoppingListRow(listRow, itemRows);
  }

  async createActive(marketId: string, name: string): Promise<ShoppingList> {
    const database = await getDatabase();
    const now = new Date().toISOString();
    const list: ShoppingList = {
      id: createId(),
      marketId,
      name,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    await database.runAsync(
      "UPDATE shopping_lists SET is_active = 0, updated_at = ?",
      [now],
    );
    await database.runAsync(
      `INSERT INTO shopping_lists (id, market_id, name, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [list.id, list.marketId, list.name, list.createdAt, list.updatedAt],
    );

    return list;
  }

  async save(list: ShoppingList): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      "UPDATE shopping_lists SET is_active = 0, updated_at = ?",
      [list.updatedAt],
    );
    await database.runAsync(
      `INSERT INTO shopping_lists (id, market_id, name, is_active, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [list.id, list.marketId, list.name, list.createdAt, list.updatedAt],
    );

    for (const item of list.items) {
      await this.addItem(item);
    }
  }

  async update(list: ShoppingList): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      `UPDATE shopping_lists
       SET market_id = ?, name = ?, updated_at = ?
       WHERE id = ?`,
      [list.marketId, list.name, list.updatedAt, list.id],
    );
  }

  async addItem(item: ShoppingListItem): Promise<void> {
    const database = await getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `INSERT INTO shopping_list_items
       (id, list_id, name, normalized_name, quantity, section_name, category_id, is_purchased, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.listId,
        item.name,
        item.normalizedName,
        item.quantity ?? null,
        item.sectionName,
        item.categoryId ?? null,
        item.isPurchased ? 1 : 0,
        item.createdAt,
        item.updatedAt,
      ],
    );

    await database.runAsync(
      "UPDATE shopping_lists SET updated_at = ? WHERE id = ?",
      [now, item.listId],
    );
  }

  async updateItemPurchaseStatus(
    itemId: string,
    isPurchased: boolean,
  ): Promise<void> {
    const database = await getDatabase();
    const now = new Date().toISOString();

    const itemRow = await database.getFirstAsync<{ list_id: string }>(
      "SELECT list_id FROM shopping_list_items WHERE id = ? LIMIT 1",
      [itemId],
    );

    await database.runAsync(
      `UPDATE shopping_list_items
       SET is_purchased = ?, updated_at = ?
       WHERE id = ?`,
      [isPurchased ? 1 : 0, now, itemId],
    );

    if (itemRow?.list_id) {
      await database.runAsync(
        "UPDATE shopping_lists SET updated_at = ? WHERE id = ?",
        [now, itemRow.list_id],
      );
    }
  }

  async updateItemSection(itemId: string, sectionName: string): Promise<void> {
    const database = await getDatabase();
    const now = new Date().toISOString();

    const itemRow = await database.getFirstAsync<{ list_id: string }>(
      "SELECT list_id FROM shopping_list_items WHERE id = ? LIMIT 1",
      [itemId],
    );

    await database.runAsync(
      `UPDATE shopping_list_items
       SET section_name = ?, updated_at = ?
       WHERE id = ?`,
      [sectionName, now, itemId],
    );

    if (itemRow?.list_id) {
      await database.runAsync(
        "UPDATE shopping_lists SET updated_at = ? WHERE id = ?",
        [now, itemRow.list_id],
      );
    }
  }

  async removeItem(itemId: string): Promise<void> {
    const database = await getDatabase();
    const now = new Date().toISOString();

    const itemRow = await database.getFirstAsync<{ list_id: string }>(
      "SELECT list_id FROM shopping_list_items WHERE id = ? LIMIT 1",
      [itemId],
    );

    await database.runAsync("DELETE FROM shopping_list_items WHERE id = ?", [
      itemId,
    ]);

    if (itemRow?.list_id) {
      await database.runAsync(
        "UPDATE shopping_lists SET updated_at = ? WHERE id = ?",
        [now, itemRow.list_id],
      );
    }
  }

  async clearItems(listId: string): Promise<void> {
    const database = await getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      "DELETE FROM shopping_list_items WHERE list_id = ?",
      [listId],
    );
    await database.runAsync(
      "UPDATE shopping_lists SET updated_at = ? WHERE id = ?",
      [now, listId],
    );
  }

  private async getItemRows(listId: string): Promise<ShoppingListItemRow[]> {
    const database = await getDatabase();

    return database.getAllAsync<ShoppingListItemRow>(
      `SELECT id, list_id, name, normalized_name, quantity, section_name, category_id, is_purchased, created_at, updated_at
       FROM shopping_list_items
       WHERE list_id = ?
       ORDER BY created_at ASC`,
      [listId],
    );
  }
}
