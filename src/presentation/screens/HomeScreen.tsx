import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../app/navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Lista de Mercado Fácil</Text>
        <Text style={styles.description}>
          Organize sua lista de compras por setores do supermercado e reduza o deslocamento durante a compra.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ShoppingList')}>
          <Text style={styles.primaryButtonText}>Abrir lista</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Markets')}>
          <Text style={styles.secondaryButtonText}>Supermercados</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2933',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    color: '#52606D',
  },
  primaryButton: {
    backgroundColor: '#1F2933',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#CBD2D9',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1F2933',
    fontSize: 16,
    fontWeight: '600',
  },
});
