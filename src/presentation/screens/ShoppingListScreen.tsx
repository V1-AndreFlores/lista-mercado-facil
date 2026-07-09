import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AddItemToShoppingListUseCase } from '../../domain/use-cases/AddItemToShoppingListUseCase';
import { SortShoppingListByMarketRouteUseCase } from '../../domain/use-cases/SortShoppingListByMarketRouteUseCase';
import { ProductCategorizer } from '../../domain/services/ProductCategorizer';
import { ShoppingList } from '../../domain/entities/ShoppingList';
import { Market } from '../../domain/entities/Market';
import { defaultCategories } from '../../infrastructure/seed/defaultCategories';
import { initializeDatabase } from '../../infrastructure/database/database';
import { SQLiteMarketRepository } from '../../infrastructure/repositories/SQLiteMarketRepository';
import { createId } from '../../shared/utils/createId';

export function ShoppingListScreen() {
  const now = useMemo(() => new Date().toISOString(), []);
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [list, setList] = useState<ShoppingList | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDefaultMarket() {
      await initializeDatabase();
      const repository = new SQLiteMarketRepository();
      const markets = await repository.getAll();
      const defaultMarket = markets.find((item) => item.isDefault) ?? markets[0] ?? null;

      if (!isMounted) {
        return;
      }

      setMarket(defaultMarket);
      setList(
        defaultMarket
          ? {
              id: createId(),
              marketId: defaultMarket.id,
              name: 'Compra da semana',
              items: [],
              createdAt: now,
              updatedAt: now,
            }
          : null,
      );
      setIsLoading(false);
    }

    void loadDefaultMarket();

    return () => {
      isMounted = false;
    };
  }, [now]);

  const addItemUseCase = useMemo(
    () => new AddItemToShoppingListUseCase(new ProductCategorizer(defaultCategories)),
    [],
  );

  const sortUseCase = useMemo(() => new SortShoppingListByMarketRouteUseCase(), []);
  const sections = list && market ? sortUseCase.execute(list, market) : [];

  function handleAddItem() {
    if (!productName.trim() || !list) {
      return;
    }

    const updatedList = addItemUseCase.execute({
      list,
      productName,
    });

    setList(updatedList);
    setProductName('');
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Carregando lista...</Text>
      </SafeAreaView>
    );
  }

  if (!market || !list) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={styles.emptyText}>Nenhum supermercado cadastrado.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.marketHeader}>
        <Text style={styles.marketLabel}>Supermercado</Text>
        <Text style={styles.marketName}>{market.name}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          value={productName}
          onChangeText={setProductName}
          placeholder="Ex.: arroz, banana, leite"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {sections.length === 0 ? (
          <Text style={styles.emptyText}>Adicione itens para começar a organizar sua compra.</Text>
        ) : (
          sections.map((section) => (
            <View key={section.sectionName} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.sectionName}</Text>
              {section.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemText}>{item.name}</Text>
                </View>
              ))}
            </View>
          ))
        )}
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#52606D',
  },
  marketHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  marketLabel: {
    fontSize: 12,
    color: '#7B8794',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  marketName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2933',
  },
  form: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EB',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD2D9',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#1F2933',
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    color: '#52606D',
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 10,
  },
  itemRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F4',
  },
  itemText: {
    fontSize: 16,
    color: '#323F4B',
  },
});
