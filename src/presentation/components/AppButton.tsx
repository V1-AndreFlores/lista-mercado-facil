import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from './useAppTheme';

type AppButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps extends PropsWithChildren {
  onPress: () => void;
  variant?: AppButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({ children, onPress, variant = 'primary', disabled = false, style }: AppButtonProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, disabled);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && !disabled ? styles.pressed : null, style]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primary}
        >
          <Text style={[styles.text, styles.primaryText]}>{children}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.buttonBase, styles[variant]]}>
          <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, disabled: boolean) {
  return StyleSheet.create({
    pressable: {
      borderRadius: theme.radius.lg,
      opacity: disabled ? 0.55 : 1,
    },
    pressed: {
      transform: [{ scale: 0.985 }],
    },
    buttonBase: {
      minHeight: 52,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1,
    },
    primary: {
      minHeight: 52,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: theme.mode === 'dark' ? 0.26 : 0.18,
      shadowRadius: 18,
      elevation: 4,
    },
    secondary: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    text: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.1,
    },
    primaryText: {
      color: theme.colors.primaryText,
    },
    secondaryText: {
      color: theme.colors.text,
    },
    ghostText: {
      color: theme.colors.primary,
    },
  });
}
