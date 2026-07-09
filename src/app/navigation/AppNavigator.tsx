import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../../presentation/screens/HomeScreen';
import { MarketsScreen } from '../../presentation/screens/MarketsScreen';
import { SettingsScreen } from '../../presentation/screens/SettingsScreen';
import { ShoppingListScreen } from '../../presentation/screens/ShoppingListScreen';
import { SplashScreen } from '../../presentation/screens/SplashScreen';
import { useAppSelector } from '../store/hooks';
import { getAppTheme } from '../theme/AppTheme';
import { RootStackParamList } from './RootStackParamList';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const appTheme = getAppTheme(themeMode);
  const navigationTheme = themeMode === 'dark' ? NavigationDarkTheme : NavigationLightTheme;

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: appTheme.colors.background,
          card: appTheme.colors.surface,
          text: appTheme.colors.text,
          border: appTheme.colors.border,
          primary: appTheme.colors.primary,
        },
      }}
    >
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: appTheme.colors.background,
          },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
        <Stack.Screen name="Markets" component={MarketsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}