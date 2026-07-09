import { ShoppingList } from '../../domain/entities/ShoppingList';
import { ShoppingListItem } from '../../domain/entities/ShoppingListItem';
import { ShoppingListRepository } from '../../domain/repositories/ShoppingListRepository';
import { createId } from '../../shared/utils/createId';
import { getDatabase } from '../database/database';
import {
  ShoppingListItemRow,
  ShoppingListRow,
  mapShoppingListRow,
} from './mappers/SQLiteShoppingListMapper';

export class SQLiteShoppingListRepository implements ShoppingListRepository {
  async getAll(): Promise<ShoppingList[]> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const listRows = await database.getAllAsync<ShoppingListRow>(
      `SELECT id, market_id, name, status, completed_at, created_at, updated_at
       FROM shopping_lists
       ORDER BY updated_at DESC`,
    );

    return Promise.all(listRows.map((row) => this.mapListWithItems(row)));
  }

  async getActive(): Promise<ShoppingList | null> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const listRow = await database.getFirstAsync<ShoppingListRow>(
      `SELECT id, market_id, name, status, completed_at, created_at, updated_at
       FROM shopping_lists
       WHERE is_active = 1 AND status != 'completed'
       ORDER BY updated_at DESC
       LIMIT 1`,
    );

    if (!listRow) {
      return null;
    }

    return this.getById(listRow.id);
  }

  async getCompleted(): Promise<ShoppingList[]> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const listRows = await database.getAllAsync<ShoppingListRow>(
      `SELECT id, market_id, name, status, completed_at, created_at, updated_at
       FROM shopping_lists
       WHERE status = 'completed'
       ORDER BY COALESCE(completed_at, updated_at) DESC`,
    );

    return Promise.all(listRows.map((row) => this.mapListWithItems(row)));
  }

  async getById(id: string): Promise<ShoppingList | null> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const listRow = await database.getFirstAsync<ShoppingListRow>(
      `SELECT id, market_id, name, status, completed_at, created_at, updated_at
       FROM shopping_lists
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    if (!listRow) {
      return null;
    }

    return this.mapListWithItems(listRow);
  }

  async createActive(marketId: string, name: string): Promise<ShoppingList> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();
    const list: ShoppingList = {
      id: createId(),
      marketId,
      name: name.trim(),
      status: 'active',
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    await database.runAsync(
      "UPDATE shopping_lists SET is_active = 0, updated_at = ? WHERE status != 'completed'",
      [now],
    );
    await database.runAsync(
      `INSERT INTO shopping_lists (id, market_id, name, is_active, status, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, 1, 'active', NULL, ?, ?)`,
      [list.id, list.marketId, list.name, list.createdAt, list.updatedAt],
    );

    return list;
  }

  async setActive(listId: string): Promise<ShoppingList | null> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const list = await this.getById(listId);

    if (!list || list.status === 'completed') {
      return null;
    }

    const now = new Date().toISOString();
    await database.runAsync(
      "UPDATE shopping_lists SET is_active = 0, updated_at = ? WHERE status != 'completed'",
      [now],
    );
    await database.runAsync(
      "UPDATE shopping_lists SET is_active = 1, updated_at = ? WHERE id = ?",
      [now, listId],
    );

    return this.getById(listId);
  }

  async save(list: ShoppingList): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const normalizedList = this.normalizeList(list);

    await database.runAsync(
      `INSERT OR REPLACE INTO shopping_lists
       (id, market_id, name, is_active, status, completed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedList.id,
        normalizedList.marketId,
        normalizedList.name,
        normalizedList.status === 'completed' ? 0 : 1,
        normalizedList.status,
        normalizedList.completedAt ?? null,
        normalizedList.createdAt,
        normalizedList.updatedAt,
      ],
    );

    for (const item of normalizedList.items) {
      await this.addItem(item);
    }
  }

  async update(list: ShoppingList): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const normalizedList = this.normalizeList(list);

    await database.runAsync(
      `UPDATE shopping_lists
       SET market_id = ?, name = ?, status = ?, completed_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        normalizedList.marketId,
        normalizedList.name,
        normalizedList.status,
        normalizedList.completedAt ?? null,
        normalizedList.updatedAt,
        normalizedList.id,
      ],
    );
  }

  async completeList(listId: string): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `UPDATE shopping_lists
       SET status = 'completed', completed_at = ?, is_active = 0, updated_at = ?
       WHERE id = ?`,
      [now, now, listId],
    );
  }

  async reuseListAsActive(sourceListId: string, name: string): Promise<ShoppingList> {
    await this.ensureListSchema();
    const sourceList = await this.getById(sourceListId);

    if (!sourceList) {
      throw new Error('Lista de origem não encontrada.');
    }

    const newList = await this.createActive(sourceList.marketId, name.trim());
    const now = new Date().toISOString();

    for (const item of sourceList.items) {
      await this.addItem({
        ...item,
        id: createId(),
        listId: newList.id,
        isPurchased: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return this.getById(newList.id) as Promise<ShoppingList>;
  }

  async addItem(item: ShoppingListItem): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `INSERT OR REPLACE INTO shopping_list_items
       (id, list_id, name, normalized_name, quantity, unit, section_name, category_id, is_purchased, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.listId,
        item.name,
        item.normalizedName,
        String(item.quantity ?? 1),
        item.unit ?? 'un',
        item.sectionName,
        item.categoryId ?? null,
        item.isPurchased ? 1 : 0,
        item.createdAt,
        item.updatedAt,
      ],
    );

    await database.runAsync(
      'UPDATE shopping_lists SET updated_at = ? WHERE id = ?',
      [now, item.listId],
    );
  }

  async updateItemPurchaseStatus(itemId: string, isPurchased: boolean): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();
    const itemRow = await database.getFirstAsync<{ list_id: string }>(
      'SELECT list_id FROM shopping_list_items WHERE id = ? LIMIT 1',
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
        'UPDATE shopping_lists SET updated_at = ? WHERE id = ?',
        [now, itemRow.list_id],
      );
    }
  }

  async updateItemSection(itemId: string, sectionName: string): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();
    const itemRow = await database.getFirstAsync<{ list_id: string }>(
      'SELECT list_id FROM shopping_list_items WHERE id = ? LIMIT 1',
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
        'UPDATE shopping_lists SET updated_at = ? WHERE id = ?',
        [now, itemRow.list_id],
      );
    }
  }

  async updateItemQuantityAndUnit(itemId: string, quantity: number, unit: string): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();
    const itemRow = await database.getFirstAsync<{ list_id: string }>(
      'SELECT list_id FROM shopping_list_items WHERE id = ? LIMIT 1',
      [itemId],
    );

    await database.runAsync(
      `UPDATE shopping_list_items
       SET quantity = ?, unit = ?, updated_at = ?
       WHERE id = ?`,
      [String(quantity > 0 ? quantity : 1), unit || 'un', now, itemId],
    );

    if (itemRow?.list_id) {
      await database.runAsync(
        'UPDATE shopping_lists SET updated_at = ? WHERE id = ?',
        [now, itemRow.list_id],
      );
    }
  }

  async removeItem(itemId: string): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();
    const itemRow = await database.getFirstAsync<{ list_id: string }>(
      'SELECT list_id FROM shopping_list_items WHERE id = ? LIMIT 1',
      [itemId],
    );

    await database.runAsync('DELETE FROM shopping_list_items WHERE id = ?', [itemId]);

    if (itemRow?.list_id) {
      await database.runAsync(
        'UPDATE shopping_lists SET updated_at = ? WHERE id = ?',
        [now, itemRow.list_id],
      );
    }
  }

  async clearItems(listId: string): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();

    await database.runAsync('DELETE FROM shopping_list_items WHERE list_id = ?', [listId]);
    await database.runAsync('UPDATE shopping_lists SET updated_at = ? WHERE id = ?', [now, listId]);
  }

  private async mapListWithItems(listRow: ShoppingListRow): Promise<ShoppingList> {
    const itemRows = await this.getItemRows(listRow.id);
    return mapShoppingListRow(listRow, itemRows);
  }

  private async getItemRows(listId: string): Promise<ShoppingListItemRow[]> {
    const database = await getDatabase();

    return database.getAllAsync<ShoppingListItemRow>(
      `SELECT id, list_id, name, normalized_name, quantity, unit, section_name, category_id, is_purchased, created_at, updated_at
       FROM shopping_list_items
       WHERE list_id = ?
       ORDER BY created_at ASC`,
      [listId],
    );
  }

  private normalizeList(list: ShoppingList): ShoppingList {
    return {
      ...list,
      name: list.name?.trim() || 'Lista de compras',
      status: list.status ?? 'active',
      items: Array.isArray(list.items) ? list.items : [],
    };
  }

  private async ensureListSchema(): Promise<void> {
    const database = await getDatabase();

    try {
      await database.runAsync("ALTER TABLE shopping_lists ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
    } catch {
      // Column already exists.
    }

    try {
      await database.runAsync('ALTER TABLE shopping_lists ADD COLUMN completed_at TEXT NULL');
    } catch {
      // Column already exists.
    }

    try {
      await database.runAsync("ALTER TABLE shopping_list_items ADD COLUMN unit TEXT NOT NULL DEFAULT 'un'");
    } catch {
      // Column already exists.
    }

    await database.runAsync(
      "UPDATE shopping_list_items SET quantity = '1' WHERE quantity IS NULL OR quantity = ''",
    );

    await database.runAsync(
      "UPDATE shopping_lists SET status = 'active' WHERE status IS NULL OR status = ''",
    );
  }
}
