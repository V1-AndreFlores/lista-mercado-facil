import { getAppTheme } from '../../app/theme/AppTheme';
import { useAppSelector } from '../../app/store/hooks';

export function useAppTheme() {
  const themeMode = useAppSelector((state) => state.theme.mode);
  return getAppTheme(themeMode);
}
