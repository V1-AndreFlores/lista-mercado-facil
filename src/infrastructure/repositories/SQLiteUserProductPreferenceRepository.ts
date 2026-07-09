import { UserProductPreference } from "../../domain/entities/UserProductPreference";
import { UserProductPreferenceRepository } from "../../domain/repositories/UserProductPreferenceRepository";
import { getDatabase } from "../database/database";

interface UserProductPreferenceRow {
  id: string;
  product_normalized_name: string;
  preferred_section_name: string;
  market_id: string | null;
  updated_at: string;
}

function mapRow(row: UserProductPreferenceRow): UserProductPreference {
  return {
    id: row.id,
    productNormalizedName: row.product_normalized_name,
    preferredSectionName: row.preferred_section_name,
    marketId: row.market_id ?? undefined,
    updatedAt: row.updated_at,
  };
}

export class SQLiteUserProductPreferenceRepository implements UserProductPreferenceRepository {
  async getPreference(
    productNormalizedName: string,
    marketId?: string,
  ): Promise<UserProductPreference | null> {
    const database = await getDatabase();

    const row = await database.getFirstAsync<UserProductPreferenceRow>(
      `SELECT id, product_normalized_name, preferred_section_name, market_id, updated_at
       FROM user_product_preferences
       WHERE product_normalized_name = ? AND (market_id = ? OR (? IS NULL AND market_id IS NULL))
       ORDER BY updated_at DESC
       LIMIT 1`,
      [productNormalizedName, marketId ?? null, marketId ?? null],
    );

    return row ? mapRow(row) : null;
  }

  async savePreference(preference: UserProductPreference): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      `DELETE FROM user_product_preferences
       WHERE product_normalized_name = ? AND (market_id = ? OR (? IS NULL AND market_id IS NULL))`,
      [
        preference.productNormalizedName,
        preference.marketId ?? null,
        preference.marketId ?? null,
      ],
    );

    await database.runAsync(
      `INSERT INTO user_product_preferences
       (id, product_normalized_name, preferred_section_name, market_id, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        preference.id,
        preference.productNormalizedName,
        preference.preferredSectionName,
        preference.marketId ?? null,
        preference.updatedAt,
      ],
    );
  }
}
