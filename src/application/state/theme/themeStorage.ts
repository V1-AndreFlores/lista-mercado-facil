import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '../../../app/theme/AppTheme';

const themeStorageKey = '@lista-mercado-facil:theme-mode';

export async function getStoredThemeMode(): Promise<ThemeMode | null> {
  const value = await AsyncStorage.getItem(themeStorageKey);

  if (value === 'light' || value === 'dark') {
    return value;
  }

  return null;
}

export async function saveThemeMode(themeMode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(themeStorageKey, themeMode);
}
