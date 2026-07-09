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
  return StyleSheet.create({
    track: {
      width: 52,
      height: 30,
      borderRadius: 30,
      padding: 3,
      justifyContent: 'center',
      alignItems: active ? 'flex-end' : 'flex-start',
      backgroundColor: active ? theme.colors.switchTrackOn : theme.colors.switchTrackOff,
      shadowColor: active ? theme.colors.primary : theme.colors.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: active ? 0.22 : 0.08,
      shadowRadius: 10,
      elevation: active ? 3 : 1,
    },
    thumb: {
      width: 24,
      height: 24,
      borderRadius: 24,
      backgroundColor: theme.colors.switchThumb,
    },
    pressed: {
      opacity: 0.86,
    },
  });
}
