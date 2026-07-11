import { ShoppingList } from '../../domain/entities/ShoppingList';
import { ShoppingListItem } from '../../domain/entities/ShoppingListItem';
import { ShoppingListRepository } from '../../domain/repositories/ShoppingListRepository';
import { createId } from '../../shared/utils/createId';
import { resolveShoppingListName } from '../../domain/constants/shoppingListDefaults';
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
      name: resolveShoppingListName(name),
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
      'UPDATE shopping_lists SET is_active = 1, updated_at = ? WHERE id = ?',
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

    await this.replaceItems(normalizedList);
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

    await this.replaceItems(normalizedList);
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

    const newList = await this.createActive(sourceList.marketId, resolveShoppingListName(name));
    const latestUnitPrices = await this.resolveLatestUnitPricesByProduct();
    const now = new Date().toISOString();

    for (const item of sourceList.items) {
      const latestUnitPriceCents = latestUnitPrices[item.normalizedName] ?? item.unitPriceCents;

      await this.addItem({
        ...item,
        id: createId(),
        listId: newList.id,
        unitPriceCents: latestUnitPriceCents,
        isPurchased: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return this.getById(newList.id) as Promise<ShoppingList>;
  }

  async getLatestUnitPriceCentsByProduct(productNormalizedName: string): Promise<number | null> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const row = await database.getFirstAsync<{ unit_price_cents: number | null }>(
      `SELECT item.unit_price_cents
       FROM shopping_list_items item
       INNER JOIN shopping_lists list ON list.id = item.list_id
       WHERE list.status = 'completed'
         AND item.normalized_name = ?
         AND item.unit_price_cents IS NOT NULL
         AND item.unit_price_cents > 0
       ORDER BY COALESCE(list.completed_at, list.updated_at) DESC, item.updated_at DESC
       LIMIT 1`,
      [productNormalizedName],
    );

    return typeof row?.unit_price_cents === 'number' && row.unit_price_cents > 0
      ? Math.trunc(row.unit_price_cents)
      : null;
  }

  async deleteList(listId: string): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();

    await database.runAsync('DELETE FROM shopping_list_items WHERE list_id = ?', [listId]);
    await database.runAsync('DELETE FROM shopping_lists WHERE id = ?', [listId]);
  }

  async pruneCompletedLists(retentionDays: number | null): Promise<void> {
    if (retentionDays === null) {
      return;
    }

    await this.ensureListSchema();
    const database = await getDatabase();
    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    const rows = await database.getAllAsync<{ id: string }>(
      `SELECT id
       FROM shopping_lists
       WHERE status = 'completed'
         AND COALESCE(completed_at, updated_at) < ?`,
      [cutoffDate],
    );

    for (const row of rows) {
      await this.deleteList(row.id);
    }
  }

  async addItem(item: ShoppingListItem): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();

    await this.upsertItem(item);

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

  async updateItemUnitPrice(itemId: string, unitPriceCents: number | null): Promise<void> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const now = new Date().toISOString();
    const itemRow = await database.getFirstAsync<{ list_id: string }>(
      'SELECT list_id FROM shopping_list_items WHERE id = ? LIMIT 1',
      [itemId],
    );

    const normalizedUnitPriceCents = typeof unitPriceCents === 'number'
      && Number.isFinite(unitPriceCents)
      && unitPriceCents > 0
      ? Math.trunc(unitPriceCents)
      : null;

    await database.runAsync(
      `UPDATE shopping_list_items
       SET unit_price_cents = ?, updated_at = ?
       WHERE id = ?`,
      [normalizedUnitPriceCents, now, itemId],
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
      `SELECT id, list_id, name, normalized_name, quantity, unit, unit_price_cents, section_name, category_id, is_purchased, created_at, updated_at
       FROM shopping_list_items
       WHERE list_id = ?
       ORDER BY created_at ASC`,
      [listId],
    );
  }

  private async replaceItems(list: ShoppingList): Promise<void> {
    const database = await getDatabase();

    await database.runAsync('DELETE FROM shopping_list_items WHERE list_id = ?', [list.id]);

    for (const item of list.items) {
      await this.upsertItem({
        ...item,
        listId: list.id,
      });
    }
  }

  private async upsertItem(item: ShoppingListItem): Promise<void> {
    const database = await getDatabase();
    const normalizedUnitPriceCents = typeof item.unitPriceCents === 'number'
      && Number.isFinite(item.unitPriceCents)
      && item.unitPriceCents > 0
      ? Math.trunc(item.unitPriceCents)
      : null;

    await database.runAsync(
      `INSERT OR REPLACE INTO shopping_list_items
       (id, list_id, name, normalized_name, quantity, unit, unit_price_cents, section_name, category_id, is_purchased, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.listId,
        item.name,
        item.normalizedName,
        String(item.quantity ?? 1),
        item.unit ?? 'un',
        normalizedUnitPriceCents,
        item.sectionName,
        item.categoryId ?? null,
        item.isPurchased ? 1 : 0,
        item.createdAt,
        item.updatedAt,
      ],
    );
  }

  private async resolveLatestUnitPricesByProduct(): Promise<Record<string, number>> {
    await this.ensureListSchema();
    const database = await getDatabase();
    const rows = await database.getAllAsync<{
      normalized_name: string;
      unit_price_cents: number | null;
    }>(
      `SELECT item.normalized_name, item.unit_price_cents
       FROM shopping_list_items item
       INNER JOIN shopping_lists list ON list.id = item.list_id
       WHERE list.status = 'completed'
         AND item.unit_price_cents IS NOT NULL
         AND item.unit_price_cents > 0
       ORDER BY COALESCE(list.completed_at, list.updated_at) DESC, item.updated_at DESC`,
    );

    return rows.reduce<Record<string, number>>((accumulator, row) => {
      if (
        !accumulator[row.normalized_name]
        && typeof row.unit_price_cents === 'number'
        && row.unit_price_cents > 0
      ) {
        accumulator[row.normalized_name] = Math.trunc(row.unit_price_cents);
      }

      return accumulator;
    }, {});
  }

  private normalizeList(list: ShoppingList): ShoppingList {
    return {
      ...list,
      name: resolveShoppingListName(list.name),
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

    try {
      await database.runAsync('ALTER TABLE shopping_list_items ADD COLUMN unit_price_cents INTEGER NULL');
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
