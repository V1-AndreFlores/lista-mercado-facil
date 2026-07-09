import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppBottomNavigation } from './AppBottomNavigation';
import { useAppTheme } from './useAppTheme';

interface AppScreenProps extends PropsWithChildren {
  scroll?: boolean;
  bottomNavigation?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AppScreen({ children, scroll = false, bottomNavigation = true, contentStyle }: AppScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.frame}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, bottomNavigation ? styles.bottomSpace : null, contentStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, bottomNavigation ? styles.bottomSpace : null, contentStyle]}>{children}</View>
        )}

        {bottomNavigation ? <AppBottomNavigation /> : null}
      </SafeAreaView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.appBackdrop,
      alignItems: 'center',
    },
    frame: {
      flex: 1,
      width: '100%',
      maxWidth: 430,
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.12,
      shadowRadius: 32,
      elevation: 8,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      backgroundColor: theme.colors.background,
    },
    bottomSpace: {
      paddingBottom: 108,
    },
  });
}
