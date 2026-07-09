import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AddItemToShoppingListUseCase } from '../../domain/use-cases/AddItemToShoppingListUseCase';
import { SortShoppingListByMarketRouteUseCase } from '../../domain/use-cases/SortShoppingListByMarketRouteUseCase';
import { ProductCategorizer } from '../../domain/services/ProductCategorizer';
import { isProductAlreadyInList } from '../../domain/services/ShoppingListDuplicateGuard';
import { ShoppingList } from '../../domain/entities/ShoppingList';
import { ShoppingListItem } from '../../domain/entities/ShoppingListItem';
import { Market } from '../../domain/entities/Market';
import { defaultCategories } from '../../infrastructure/seed/defaultCategories';
import { defaultMarkets } from '../../infrastructure/seed/defaultMarkets';
import { createId } from '../../shared/utils/createId';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { setSelectedMarketId } from '../../app/store/slices/marketSlice';
import {
  addShoppingListItem,
  clearActiveShoppingList,
  removeShoppingListItem,
  setActiveList,
  toggleShoppingListItemPurchased,
} from '../../app/store/slices/shoppingListSlice';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppGradientHeader } from '../components/AppGradientHeader';
import { AppScreen } from '../components/AppScreen';
import { AppText } from '../components/AppText';
import { useAppTheme } from '../components/useAppTheme';

export function ShoppingListScreen() {
  const dispatch = useAppDispatch();
  const activeList = useAppSelector((state) => state.shoppingList.activeList);
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [productError, setProductError] = useState<string | null>(null);
  const [isClearConfirmationVisible, setIsClearConfirmationVisible] = useState(false);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const addItemUseCase = useMemo(
    () => new AddItemToShoppingListUseCase(new ProductCategorizer(defaultCategories)),
    [],
  );

  const sortUseCase = useMemo(() => new SortShoppingListByMarketRouteUseCase(), []);
  const sections = activeList && market ? sortUseCase.execute(activeList, market) : [];
  const totalItems = activeList?.items.length ?? 0;
  const purchasedItems = activeList?.items.filter((item) => item.isPurchased).length ?? 0;
  const pendingItems = totalItems - purchasedItems;
  const trimmedProductName = productName.trim();
  const isDuplicateProduct = activeList ? isProductAlreadyInList(activeList.items, trimmedProductName) : false;
  const canAddProduct = Boolean(trimmedProductName) && !isDuplicateProduct;

  useEffect(() => {
    const defaultMarket = defaultMarkets.find((item) => item.isDefault) ?? defaultMarkets[0] ?? null;

    setMarket(defaultMarket);
    dispatch(setSelectedMarketId(defaultMarket?.id ?? null));

    if (defaultMarket && !activeList) {
      const now = new Date().toISOString();
      const list: ShoppingList = {
        id: createId(),
        marketId: defaultMarket.id,
        name: 'Compra da semana',
        items: [],
        createdAt: now,
        updatedAt: now,
      };

      dispatch(setActiveList(list));
    }

    setIsLoading(false);
  }, [activeList, dispatch]);

  function handleProductNameChange(value: string) {
    setProductName(value);

    if (productError) {
      setProductError(null);
    }
  }

  function handleAddItem() {
    if (!trimmedProductName || !activeList) {
      return;
    }

    if (isProductAlreadyInList(activeList.items, trimmedProductName)) {
      setProductError('Este produto já está na lista.');
      return;
    }

    const updatedList = addItemUseCase.execute({
      list: activeList,
      productName: trimmedProductName,
    });

    const newItem = updatedList.items[updatedList.items.length - 1];
    dispatch(addShoppingListItem(newItem));
    setProductName('');
    setProductError(null);
    Keyboard.dismiss();
  }

  function handleToggleItem(itemId: string) {
    dispatch(toggleShoppingListItemPurchased(itemId));
  }

  function handleRemoveItem(itemId: string) {
    dispatch(removeShoppingListItem(itemId));
  }

  function handleRequestClearList() {
    setIsClearConfirmationVisible(true);
  }

  function handleCancelClearList() {
    setIsClearConfirmationVisible(false);
  }

  function handleConfirmClearList() {
    dispatch(clearActiveShoppingList());
    setProductError(null);
    setIsClearConfirmationVisible(false);
  }

  if (isLoading) {
    return (
      <AppScreen bottomNavigation={false} contentStyle={styles.centeredContainer}>
        <ActivityIndicator color={theme.colors.primary} />
        <AppText muted style={styles.loadingText}>Carregando lista...</AppText>
      </AppScreen>
    );
  }

  if (!market || !activeList) {
    return (
      <AppScreen contentStyle={styles.centeredContainer}>
        <AppText muted>Nenhum supermercado cadastrado.</AppText>
      </AppScreen>
    );
  }

  return (
    <>
      <AppScreen scroll>
      <AppGradientHeader
        compact
        eyebrow="Lista ativa"
        title="Compra da semana"
        description={market.name}
      />

      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <SummaryPill label="Pendentes" value={pendingItems} />
          <SummaryPill label="Comprados" value={purchasedItems} />
          <SummaryPill label="Total" value={totalItems} />
        </View>

        <AppCard elevated style={styles.formCard}>
          <View style={styles.formHeader}>
            <View>
              <AppText variant="label" accent>Adicionar produto</AppText>
              <AppText muted style={styles.formSubtitle}>Digite um item por vez. O setor será identificado automaticamente.</AppText>
            </View>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={productName}
              onChangeText={handleProductNameChange}
              placeholder="Ex.: arroz, banana, leite"
              placeholderTextColor={theme.colors.textSubtle}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleAddItem}
              autoCorrect={false}
            />
          </View>

          {(isDuplicateProduct || productError) ? (
            <AppText variant="caption" style={styles.validationMessage}>
              Este produto já está na lista.
            </AppText>
          ) : null}

          <AppButton style={styles.addButton} disabled={!canAddProduct} onPress={handleAddItem}>
            Adicionar à lista
          </AppButton>
        </AppCard>

        {sections.length === 0 ? (
          <EmptyShoppingList />
        ) : (
          <View style={styles.sectionsContainer}>
            <View style={styles.listHeader}>
              <View>
                <AppText variant="label" accent>Rota de compra</AppText>
                <AppText muted style={styles.listHint}>Itens comprados ficam no final de cada setor.</AppText>
              </View>

              <Pressable onPress={handleRequestClearList} style={({ pressed }) => [styles.clearButton, pressed ? styles.pressed : null]}>
                <AppText variant="caption" style={styles.clearButtonText}>Limpar</AppText>
              </Pressable>
            </View>

            {sections.map((section, index) => (
              <AppCard key={section.sectionName} elevated style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionOrder}>
                    <AppText variant="caption" style={styles.sectionOrderText}>{index + 1}</AppText>
                  </View>
                  <View style={styles.sectionTextContainer}>
                    <AppText variant="subtitle" style={styles.sectionTitle}>{section.sectionName}</AppText>
                    <AppText subtle variant="caption">{section.items.length} item{section.items.length === 1 ? '' : 's'}</AppText>
                  </View>
                </View>

                <View style={styles.itemsContainer}>
                  {section.items.map((item) => (
                    <ShoppingItemRow
                      key={item.id}
                      item={item}
                      onToggle={() => handleToggleItem(item.id)}
                      onRemove={() => handleRemoveItem(item.id)}
                    />
                  ))}
                </View>
              </AppCard>
            ))}
          </View>
        )}
      </View>
      </AppScreen>

      <ConfirmClearListModal
      visible={isClearConfirmationVisible}
      onCancel={handleCancelClearList}
      onConfirm={handleConfirmClearList}
      />
    </>
  );
}

interface SummaryPillProps {
  label: string;
  value: number;
}

function SummaryPill({ label, value }: SummaryPillProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.summaryPill}>
      <AppText variant="headline" style={styles.summaryValue}>{value}</AppText>
      <AppText subtle variant="caption" style={styles.summaryLabel}>{label}</AppText>
    </View>
  );
}

function EmptyShoppingList() {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <AppCard elevated style={styles.emptyCard}>
      <View style={styles.emptyAccent} />
      <AppText variant="subtitle">Sua lista ainda está vazia</AppText>
      <AppText muted style={styles.emptyText}>
        Adicione produtos para montar a primeira rota de compra. Itens como banana, arroz, leite e detergente já serão agrupados por setor.
      </AppText>
    </AppCard>
  );
}


interface ConfirmClearListModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmClearListModal({ visible, onCancel, onConfirm }: ConfirmClearListModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>Limpar lista?</AppText>
          <AppText muted style={styles.modalDescription}>
            Essa ação remove todos os produtos da lista atual. Use apenas quando realmente quiser começar uma nova compra.
          </AppText>

          <View style={styles.modalActions}>
            <Pressable onPress={onCancel} style={({ pressed }) => [styles.modalButton, styles.modalCancelButton, pressed ? styles.pressed : null]}>
              <AppText variant="caption" style={styles.modalCancelText}>Cancelar</AppText>
            </Pressable>

            <Pressable onPress={onConfirm} style={({ pressed }) => [styles.modalButton, styles.modalDangerButton, pressed ? styles.pressed : null]}>
              <AppText variant="caption" style={styles.modalDangerText}>Limpar lista</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ShoppingItemRowProps {
  item: ShoppingListItem;
  onToggle: () => void;
  onRemove: () => void;
}

function ShoppingItemRow({ item, onToggle, onRemove }: ShoppingItemRowProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={[styles.itemRow, item.isPurchased ? styles.itemRowPurchased : null]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.isPurchased }}
        onPress={onToggle}
        style={({ pressed }) => [styles.checkArea, pressed ? styles.pressed : null]}
      >
        <View style={[styles.checkbox, item.isPurchased ? styles.checkboxChecked : null]}>
          {item.isPurchased ? <View style={styles.checkboxInner} /> : null}
        </View>
      </Pressable>

      <Pressable onPress={onToggle} style={({ pressed }) => [styles.itemTextArea, pressed ? styles.pressed : null]}>
        <AppText style={[styles.itemName, item.isPurchased ? styles.itemNamePurchased : null]}>
          {item.name}
        </AppText>
        <AppText subtle variant="caption">{item.isPurchased ? 'Comprado' : 'Pendente'}</AppText>
      </Pressable>

      <Pressable onPress={onRemove} style={({ pressed }) => [styles.removeButton, pressed ? styles.pressed : null]}>
        <AppText variant="caption" style={styles.removeButtonText}>Remover</AppText>
      </Pressable>
    </View>
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
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    summaryPill: {
      flex: 1,
      minHeight: 74,
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.mode === 'dark' ? 0.14 : 0.06,
      shadowRadius: 14,
      elevation: 2,
    },
    summaryValue: {
      color: theme.colors.primary,
      fontSize: 24,
      lineHeight: 30,
    },
    summaryLabel: {
      marginTop: 2,
      fontWeight: '700',
    },
    formCard: {
      padding: theme.spacing.xl,
    },
    formHeader: {
      marginBottom: theme.spacing.md,
    },
    formSubtitle: {
      marginTop: theme.spacing.xs,
      fontSize: 13,
      lineHeight: 19,
    },
    inputRow: {
      gap: theme.spacing.sm,
    },
    input: {
      minHeight: 54,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      backgroundColor: theme.colors.inputBackground,
    },
    validationMessage: {
      marginTop: theme.spacing.sm,
      color: theme.mode === 'dark' ? '#FCA5A5' : '#B91C1C',
      fontWeight: '800',
    },
    addButton: {
      marginTop: theme.spacing.md,
      width: '100%',
    },
    emptyCard: {
      position: 'relative',
      overflow: 'hidden',
      padding: theme.spacing.xl,
    },
    emptyAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: theme.colors.accent,
    },
    emptyText: {
      marginTop: theme.spacing.sm,
    },
    sectionsContainer: {
      gap: theme.spacing.lg,
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    listHint: {
      marginTop: 2,
      fontSize: 13,
      lineHeight: 18,
    },
    clearButton: {
      minHeight: 34,
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
    },
    clearButtonText: {
      color: theme.colors.primary,
      fontWeight: '900',
    },
    section: {
      padding: 0,
      overflow: 'hidden',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    sectionOrder: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primarySoft,
    },
    sectionOrderText: {
      color: theme.colors.primaryStrong,
      fontWeight: '900',
    },
    sectionTextContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: 17,
      lineHeight: 23,
    },
    itemsContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    itemRow: {
      minHeight: 70,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    itemRowPurchased: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    checkArea: {
      width: 40,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: theme.colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    checkboxChecked: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    checkboxInner: {
      width: 8,
      height: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.primaryText,
    },
    itemTextArea: {
      flex: 1,
      minHeight: 48,
      justifyContent: 'center',
    },
    itemName: {
      fontWeight: '800',
      textTransform: 'capitalize',
    },
    itemNamePurchased: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSubtle,
    },
    removeButton: {
      minHeight: 36,
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.backgroundAlt,
    },
    removeButtonText: {
      color: theme.colors.textMuted,
      fontWeight: '900',
    },
    modalOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      backgroundColor: theme.mode === 'dark' ? 'rgba(2, 6, 23, 0.78)' : 'rgba(15, 23, 42, 0.34)',
    },
    modalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: theme.mode === 'dark' ? 0.42 : 0.18,
      shadowRadius: 30,
      elevation: 8,
    },
    modalTitle: {
      color: theme.colors.text,
    },
    modalDescription: {
      marginTop: theme.spacing.sm,
      lineHeight: 22,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },
    modalButton: {
      minHeight: 42,
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
    },
    modalCancelButton: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    modalDangerButton: {
      backgroundColor: theme.mode === 'dark' ? '#7F1D1D' : '#FEE2E2',
    },
    modalCancelText: {
      color: theme.colors.textMuted,
      fontWeight: '900',
    },
    modalDangerText: {
      color: theme.mode === 'dark' ? '#FECACA' : '#B91C1C',
      fontWeight: '900',
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
