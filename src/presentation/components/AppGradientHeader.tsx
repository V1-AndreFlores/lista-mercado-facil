import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from './useAppTheme';

interface AppGradientHeaderProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  description?: string;
  compact?: boolean;
}

export function AppGradientHeader({ eyebrow, title, description, compact = false, children }: AppGradientHeaderProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme, compact);

  return (
    <LinearGradient colors={theme.gradients.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
      <View style={styles.content}>
        {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
        <Text style={styles.title}>{title}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
        {children}
      </View>
    </LinearGradient>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>, compact: boolean) {
  return StyleSheet.create({
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: compact ? theme.spacing.xxl : theme.spacing.xxxl,
      paddingBottom: compact ? theme.spacing.xl : theme.spacing.xxl,
      borderBottomRightRadius: 34,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: theme.mode === 'dark' ? 0.24 : 0.14,
      shadowRadius: 24,
      elevation: 5,
    },
    content: {
      width: '100%',
    },
    eyebrow: {
      color: theme.colors.headerMuted,
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: theme.spacing.sm,
    },
    title: {
      color: theme.colors.headerText,
      fontSize: compact ? 25 : 31,
      lineHeight: compact ? 32 : 38,
      fontWeight: '900',
      letterSpacing: -0.55,
    },
    description: {
      color: theme.colors.headerMuted,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500',
      marginTop: theme.spacing.md,
      maxWidth: 330,
    },
  });
}
