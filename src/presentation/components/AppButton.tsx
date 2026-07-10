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
  const styles = createStyles(theme);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && !disabled ? styles.pressed : null, style]}
    >
      {variant === 'primary' ? (
        disabled ? (
          <View style={[styles.primary, styles.primaryDisabled]}>
            <Text style={[styles.text, styles.primaryText, styles.primaryTextDisabled]}>{children}</Text>
          </View>
        ) : (
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primary}
          >
            <Text style={[styles.text, styles.primaryText]}>{children}</Text>
          </LinearGradient>
        )
      ) : (
        <View
          style={[
            styles.buttonBase,
            variant === 'secondary' ? styles.secondary : styles.ghost,
            disabled ? styles.disabledNonPrimary : null,
          ]}
        >
          <Text
            style={[
              styles.text,
              variant === 'secondary' ? styles.secondaryText : styles.ghostText,
              disabled ? styles.disabledNonPrimaryText : null,
            ]}
          >
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    pressable: {
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
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
    primaryDisabled: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(14, 165, 233, 0.34)' : '#7DD3FC',
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    secondary: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    disabledNonPrimary: {
      opacity: 0.55,
    },
    text: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.1,
      backgroundColor: 'transparent',
    },
    primaryText: {
      color: theme.colors.primaryText,
    },
    primaryTextDisabled: {
      color: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.62)' : 'rgba(255, 255, 255, 0.72)',
    },
    secondaryText: {
      color: theme.colors.text,
    },
    ghostText: {
      color: theme.colors.primary,
    },
    disabledNonPrimaryText: {
      opacity: 0.8,
    },
  });
}
