import { Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from './AppCard';
import { AppText } from './AppText';
import { useAppTheme } from './useAppTheme';

interface AppActionCardProps {
  label: string;
  title: string;
  description: string;
  onPress: () => void;
}

export function AppActionCard({ label, title, description, onPress }: AppActionCardProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed ? styles.pressed : null]}>
      <AppCard style={styles.card} compact>
        <View style={styles.accentBar} />
        <AppText variant="caption" accent style={styles.label}>{label}</AppText>
        <AppText variant="subtitle" style={styles.title}>{title}</AppText>
        <AppText muted style={styles.description}>{description}</AppText>
      </AppCard>
    </Pressable>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    pressable: {
      flex: 1,
      minWidth: 0,
    },
    pressed: {
      transform: [{ translateY: 1 }],
      opacity: 0.92,
    },
    card: {
      minHeight: 146,
      position: 'relative',
      overflow: 'hidden',
    },
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: theme.colors.accent,
    },
    label: {
      marginLeft: theme.spacing.xs,
    },
    title: {
      marginLeft: theme.spacing.xs,
      marginTop: theme.spacing.sm,
      fontSize: 17,
      lineHeight: 22,
    },
    description: {
      marginLeft: theme.spacing.xs,
      marginTop: theme.spacing.xs,
      fontSize: 13,
      lineHeight: 19,
    },
  });
}
