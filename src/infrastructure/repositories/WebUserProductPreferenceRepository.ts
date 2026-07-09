import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProductPreference } from "../../domain/entities/UserProductPreference";
import { UserProductPreferenceRepository } from "../../domain/repositories/UserProductPreferenceRepository";

const userProductPreferencesStorageKey =
  "@lista-mercado-facil:user-product-preferences";

function isSameScope(
  preference: UserProductPreference,
  productNormalizedName: string,
  marketId?: string,
): boolean {
  return (
    preference.productNormalizedName === productNormalizedName &&
    (preference.marketId ?? null) === (marketId ?? null)
  );
}

export class WebUserProductPreferenceRepository implements UserProductPreferenceRepository {
  async getPreference(
    productNormalizedName: string,
    marketId?: string,
  ): Promise<UserProductPreference | null> {
    const preferences = await this.readPreferences();
    return (
      preferences.find((preference) =>
        isSameScope(preference, productNormalizedName, marketId),
      ) ?? null
    );
  }

  async savePreference(preference: UserProductPreference): Promise<void> {
    const preferences = await this.readPreferences();
    const nextPreferences = [
      ...preferences.filter(
        (currentPreference) =>
          !isSameScope(
            currentPreference,
            preference.productNormalizedName,
            preference.marketId,
          ),
      ),
      preference,
    ];

    await AsyncStorage.setItem(
      userProductPreferencesStorageKey,
      JSON.stringify(nextPreferences),
    );
  }

  private async readPreferences(): Promise<UserProductPreference[]> {
    const rawValue = await AsyncStorage.getItem(
      userProductPreferencesStorageKey,
    );

    if (!rawValue) {
      return [];
    }

    try {
      return JSON.parse(rawValue) as UserProductPreference[];
    } catch {
      await AsyncStorage.removeItem(userProductPreferencesStorageKey);
      return [];
    }
  }
}
