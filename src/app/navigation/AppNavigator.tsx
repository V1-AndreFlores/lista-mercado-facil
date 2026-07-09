import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../../presentation/screens/HomeScreen';
import { MarketsScreen } from '../../presentation/screens/MarketsScreen';
import { ShoppingListScreen } from '../../presentation/screens/ShoppingListScreen';

export type RootStackParamList = {
  Home: undefined;
  ShoppingList: undefined;
  Markets: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Lista de Mercado Fácil' }}
        />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingListScreen}
          options={{ title: 'Lista de compras' }}
        />
        <Stack.Screen
          name="Markets"
          component={MarketsScreen}
          options={{ title: 'Supermercados' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
