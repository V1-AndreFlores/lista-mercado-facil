import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from './useAppTheme';

interface AppCardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  soft?: boolean;
  elevated?: boolean;
  gradient?: boolean;
  compact?: boolean;
}

export function AppCard({ children, style, soft = false, elevated = false, gradient = false, compact = false }: AppCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, soft, elevated, compact);

  if (gradient) {
    return (
      <LinearGradient colors={theme.gradients.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, style]}>
        {children}
      </LinearGradient>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

function createStyles(theme: ReturnType<typeof useAppTheme>, soft: boolean, elevated: boolean, compact: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: soft ? theme.colors.cardSoft : theme.colors.card,
      borderRadius: theme.radius.lg,
      borderWidth: theme.mode === 'dark' ? 1 : 0,
      borderColor: theme.colors.border,
      padding: compact ? theme.spacing.lg : theme.spacing.xl,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: elevated ? 14 : 8 },
      shadowOpacity: theme.mode === 'dark' ? (elevated ? 0.26 : 0.16) : (elevated ? 0.12 : 0.07),
      shadowRadius: elevated ? 24 : 16,
      elevation: elevated ? 5 : 2,
    },
  });
}
