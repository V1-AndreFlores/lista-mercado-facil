import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppSettings,
  HistoryRetentionDays,
  defaultAppSettings,
} from '../../domain/entities/AppSettings';

const appSettingsStorageKey = '@lista-mercado-facil:app-settings';

export class AppSettingsRepository {
  async getSettings(): Promise<AppSettings> {
    const rawValue = await AsyncStorage.getItem(appSettingsStorageKey);

    if (!rawValue) {
      return defaultAppSettings;
    }

    try {
      const parsedSettings = JSON.parse(rawValue) as Partial<AppSettings>;

      return {
        historyRetentionDays: parseHistoryRetentionDays(
          parsedSettings.historyRetentionDays,
        ),
      };
    } catch {
      await AsyncStorage.removeItem(appSettingsStorageKey);
      return defaultAppSettings;
    }
  }

  async saveHistoryRetentionDays(
    historyRetentionDays: HistoryRetentionDays,
  ): Promise<void> {
    const currentSettings = await this.getSettings();
    const nextSettings: AppSettings = {
      ...currentSettings,
      historyRetentionDays: parseHistoryRetentionDays(historyRetentionDays),
    };

    await AsyncStorage.setItem(appSettingsStorageKey, JSON.stringify(nextSettings));
  }
}

function parseHistoryRetentionDays(value: unknown): HistoryRetentionDays {
  if (value === null || value === undefined || value === 'always') {
    return null;
  }

  const parsedValue = typeof value === 'number' ? value : Number(value);

  return parsedValue === 30 || parsedValue === 60 || parsedValue === 90
    ? parsedValue
    : null;
}
