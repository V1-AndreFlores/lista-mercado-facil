import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../app/navigation/AppNavigator';
import { useAppTheme } from './useAppTheme';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type CurrentRoute = RouteProp<RootStackParamList, keyof RootStackParamList>;

const items: Array<{ routeName: keyof RootStackParamList; label: string }> = [
  { routeName: 'Home', label: 'Início' },
  { routeName: 'ShoppingList', label: 'Lista' },
  { routeName: 'Markets', label: 'Mercados' },
  { routeName: 'Settings', label: 'Ajustes' },
];

export function AppBottomNavigation() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<CurrentRoute>();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.wrapper}>
      <View style={styles.nav}>
        {items.map((item) => {
          const isActive = route.name === item.routeName;

          return (
            <Pressable
              key={item.routeName}
              onPress={() => navigation.navigate(item.routeName)}
              style={({ pressed }) => [styles.item, pressed ? styles.pressed : null]}
            >
              <Text style={[styles.label, isActive ? styles.labelActive : null]}>{item.label}</Text>
              <View style={[styles.activeLine, isActive ? styles.activeLineVisible : null]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    nav: {
      minHeight: 58,
      backgroundColor: theme.colors.navBackground,
      borderRadius: theme.radius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: theme.mode === 'dark' ? 0.22 : 0.08,
      shadowRadius: 18,
      elevation: 4,
    },
    item: {
      flex: 1,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    pressed: {
      opacity: 0.72,
    },
    label: {
      color: theme.colors.navText,
      fontSize: 12,
      fontWeight: '800',
    },
    labelActive: {
      color: theme.colors.navTextActive,
      fontWeight: '900',
    },
    activeLine: {
      width: 18,
      height: 3,
      borderRadius: 3,
      backgroundColor: 'transparent',
    },
    activeLineVisible: {
      backgroundColor: theme.colors.accent,
    },
  });
}
