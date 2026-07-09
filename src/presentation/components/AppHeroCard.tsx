import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from './useAppTheme';

interface AppHeroCardProps extends PropsWithChildren {
  compact?: boolean;
}

export function AppHeroCard({ children, compact = false }: AppHeroCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, compact);

  return (
    <LinearGradient colors={theme.gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.decorLine} />
      <View style={styles.decorCircleLarge} />
      <View style={styles.decorCircleSmall} />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, compact: boolean) {
  return StyleSheet.create({
    hero: {
      minHeight: compact ? 150 : 220,
      borderRadius: theme.radius.xxl,
      padding: compact ? theme.spacing.lg : theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      overflow: 'hidden',
      position: 'relative',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.16,
      shadowRadius: 26,
      elevation: 5,
    },
    content: {
      position: 'relative',
      zIndex: 2,
    },
    decorLine: {
      position: 'absolute',
      left: theme.spacing.xl,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: theme.colors.accent,
      opacity: 0.42,
    },
    decorCircleLarge: {
      position: 'absolute',
      right: -54,
      top: -54,
      width: 170,
      height: 170,
      borderRadius: 170,
      borderWidth: 1,
      borderColor: theme.colors.accent,
      opacity: 0.3,
    },
    decorCircleSmall: {
      position: 'absolute',
      right: 46,
      bottom: 34,
      width: 58,
      height: 58,
      borderRadius: 58,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      opacity: 0.42,
    },
  });
}
