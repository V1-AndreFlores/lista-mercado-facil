import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Market } from '../../domain/entities/Market';
import { initializeDatabase } from '../../infrastructure/database/database';
import { SQLiteMarketRepository } from '../../infrastructure/repositories/SQLiteMarketRepository';

export function MarketsScreen() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMarkets() {
      await initializeDatabase();
      const repository = new SQLiteMarketRepository();
      const result = await repository.getAll();

      if (isMounted) {
        setMarkets(result);
        setIsLoading(false);
      }
    }

    void loadMarkets();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Carregando supermercados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.info}>
          O supermercado inicial é criado por seed no banco local e poderá ser editado pelo usuário.
        </Text>

        {markets.map((market) => (
          <View key={market.id} style={styles.card}>
            <Text style={styles.marketName}>{market.name}</Text>
            {!!market.address && <Text style={styles.address}>{market.address}</Text>}
            <Text style={styles.sectionTitle}>Setores</Text>
            {market.sections.map((section) => (
              <Text key={section.id} style={styles.sectionItem}>
                {section.routeOrder}. {section.name}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#52606D',
  },
  content: {
    padding: 16,
  },
  info: {
    fontSize: 15,
    lineHeight: 22,
    color: '#52606D',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    marginBottom: 12,
  },
  marketName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#52606D',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#323F4B',
    marginBottom: 8,
  },
  sectionItem: {
    fontSize: 15,
    color: '#52606D',
    paddingVertical: 2,
  },
});
