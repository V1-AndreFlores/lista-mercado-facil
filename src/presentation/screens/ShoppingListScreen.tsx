import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { AddItemToShoppingListUseCase } from '../../domain/use-cases/AddItemToShoppingListUseCase';
import { SortShoppingListByMarketRouteUseCase } from '../../domain/use-cases/SortShoppingListByMarketRouteUseCase';
import { ProductCategorizer } from '../../domain/services/ProductCategorizer';
import { ShoppingList } from '../../domain/entities/ShoppingList';
import { Market } from '../../domain/entities/Market';
import { defaultCategories } from '../../infrastructure/seed/defaultCategories';
import { initializeDatabase } from '../../infrastructure/database/database';
import { SQLiteMarketRepository } from '../../infrastructure/repositories/SQLiteMarketRepository';
import { createId } from '../../shared/utils/createId';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { useAppTheme } from '../components/useAppTheme';

export function ShoppingListScreen() {
  const now = useMemo(() => new Date().toISOString(), []);
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [list, setList] = useState<ShoppingList | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

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
      <AppScreen bottomNavigation={false} contentStyle={styles.centeredContainer}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText muted style={styles.loadingText}>Carregando lista...</AppText>
      </AppScreen>
    );
  }

  if (!market || !list) {
    return (
      <AppScreen contentStyle={styles.centeredContainer}>
        <AppText muted>Nenhum supermercado cadastrado.</AppText>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll>
      <AppGradientHeader
        compact
        eyebrow="Lista ativa"
        title="Compra da semana"
        description={market.name}
      />

      <View style={styles.content}>
        <AppCard elevated style={styles.formCard}>
          <AppText variant="label" accent>Adicionar item</AppText>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Ex.: arroz, banana, leite"
            placeholderTextColor={theme.colors.textSubtle}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleAddItem}
          />
          <AppButton style={styles.addButton} onPress={handleAddItem}>
            Adicionar à lista
          </AppButton>
        </AppCard>

        {sections.length === 0 ? (
          <AppCard soft elevated>
            <AppText variant="subtitle">Sua lista ainda está vazia</AppText>
            <AppText muted style={styles.emptyText}>
              Adicione itens para começar. A lista será agrupada por setores automaticamente.
            </AppText>
          </AppCard>
        ) : (
          sections.map((section, index) => (
            <AppCard key={section.sectionName} elevated style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <AppText variant="caption" style={styles.sectionNumberText}>{index + 1}</AppText>
                </View>
                <AppText variant="subtitle" style={styles.sectionTitle}>{section.sectionName}</AppText>
              </View>

              {section.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemBullet} />
                  <AppText style={styles.itemText}>{item.name}</AppText>
                </View>
              ))}
            </AppCard>
          ))
        )}
      </View>
    </AppScreen>
  );
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    centeredContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      marginTop: theme.spacing.md,
    },
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
      
    },
    formCard: {
      padding: theme.spacing.xl,
    },
    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      fontSize: 15,
      color: theme.colors.text,
      backgroundColor: theme.colors.inputBackground,
    },
    addButton: {
      marginTop: theme.spacing.md,
      width: '100%',
    },
    emptyText: {
      marginTop: theme.spacing.sm,
    },
    section: {
      padding: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    sectionNumber: {
      minWidth: 34,
      height: 28,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primarySoft,
    },
    sectionNumberText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    sectionTitle: {
      flex: 1,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: theme.spacing.md,
    },
    itemBullet: {
      width: 4,
      height: 24,
      borderRadius: 4,
      backgroundColor: theme.colors.accent,
    },
    itemText: {
      flex: 1,
    },
  });
}
