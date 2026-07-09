import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from './useAppTheme';

interface AppThemeSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function AppThemeSwitch({ value, onValueChange }: AppThemeSwitchProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, value);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={({ pressed }) => [styles.track, pressed ? styles.pressed : null]}
    >
      <View style={styles.thumb} />
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, active: boolean) {
  const activeTrack = theme.mode === 'dark' ? '#0B3A5E' : '#BAE6FD';
  const inactiveTrack = theme.mode === 'dark' ? '#1E293B' : '#E2E8F0';
  const activeThumb = theme.mode === 'dark' ? '#38BDF8' : '#0284C7';
  const inactiveThumb = theme.mode === 'dark' ? '#64748B' : '#94A3B8';

  return StyleSheet.create({
    track: {
      width: 52,
      height: 30,
      borderRadius: 30,
      padding: 3,
      justifyContent: 'center',
      alignItems: active ? 'flex-end' : 'flex-start',
      backgroundColor: active ? activeTrack : inactiveTrack,
      borderWidth: 1,
      borderColor: active ? '#38BDF8' : theme.colors.border,
      shadowColor: active ? '#38BDF8' : theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: active ? 0.2 : 0.08,
      shadowRadius: 10,
      elevation: active ? 3 : 1,
    },
    thumb: {
      width: 22,
      height: 22,
      borderRadius: 22,
      backgroundColor: active ? activeThumb : inactiveThumb,
    },
    pressed: {
      opacity: 0.86,
    },
  });
}
