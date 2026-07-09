import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { useAppTheme } from './useAppTheme';

type AppTextVariant = 'title' | 'headline' | 'subtitle' | 'body' | 'caption' | 'label';

interface AppTextProps extends PropsWithChildren {
  variant?: AppTextVariant;
  muted?: boolean;
  subtle?: boolean;
  accent?: boolean;
  style?: StyleProp<TextStyle>;
}

export function AppText({ children, variant = 'body', muted = false, subtle = false, accent = false, style }: AppTextProps) {
  const theme = useAppTheme();
  const color = accent
    ? theme.colors.accent
    : subtle
      ? theme.colors.textSubtle
      : muted
        ? theme.colors.textMuted
        : theme.colors.text;
  const styles = createStyles(theme.colors.text, color);

  return <Text style={[styles.base, styles[variant], style]}>{children}</Text>;
}

function createStyles(defaultColor: string, color: string) {
  return StyleSheet.create({
    base: {
      color,
    },
    title: {
      color: defaultColor,
      fontSize: 30,
      lineHeight: 37,
      fontWeight: '900',
      letterSpacing: -0.55,
    },
    headline: {
      color: defaultColor,
      fontSize: 23,
      lineHeight: 31,
      fontWeight: '900',
      letterSpacing: -0.25,
    },
    subtitle: {
      fontSize: 18,
      lineHeight: 25,
      fontWeight: '800',
    },
    body: {
      fontSize: 15,
      lineHeight: 23,
      fontWeight: '400',
    },
    caption: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: '500',
    },
    label: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
  });
}
