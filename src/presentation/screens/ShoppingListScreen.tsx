import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { AddItemToShoppingListUseCase } from "../../domain/use-cases/AddItemToShoppingListUseCase";
import { SortShoppingListByMarketRouteUseCase } from "../../domain/use-cases/SortShoppingListByMarketRouteUseCase";
import { ProductCategorizer } from "../../domain/services/ProductCategorizer";
import { isProductAlreadyInList } from "../../domain/services/ShoppingListDuplicateGuard";
import { ShoppingList } from "../../domain/entities/ShoppingList";
import { ShoppingListItem, ShoppingListItemUnit } from "../../domain/entities/ShoppingListItem";
import { defaultShoppingListName, resolveShoppingListName } from "../../domain/constants/shoppingListDefaults";
import { Market } from "../../domain/entities/Market";
import { defaultCategories } from "../../infrastructure/seed/defaultCategories";
import { createMarketRepository } from "../../infrastructure/repositories/MarketRepositoryFactory";
import { createShoppingListRepository } from "../../infrastructure/repositories/ShoppingListRepositoryFactory";
import { createUserProductPreferenceRepository } from "../../infrastructure/repositories/UserProductPreferenceRepositoryFactory";
import { useAppDispatch, useAppSelector } from "../../app/store/hooks";
import { createId } from "../../shared/utils/createId";
import { formatCurrencyCents, maskCurrencyInput, multiplyCurrencyCents, parseCurrencyInputToCents } from "../../shared/utils/money";
import { setSelectedMarketId } from "../../app/store/slices/marketSlice";
import {
  addShoppingListItem,
  clearActiveShoppingList,
  removeShoppingListItem,
  setActiveList,
  toggleShoppingListItemPurchased,
  updateShoppingListItemSection,
} from "../../app/store/slices/shoppingListSlice";
import { AppButton } from "../components/AppButton";
import { AppCard } from "../components/AppCard";
import { AppGradientHeader } from "../components/AppGradientHeader";
import { AppScreen } from "../components/AppScreen";
import { AppText } from "../components/AppText";
import { useAppTheme } from "../components/useAppTheme";

const defaultProductQuantity = "1";
const defaultProductUnit: ShoppingListItemUnit = "un";


export function ShoppingListScreen() {
  const dispatch = useAppDispatch();
  const activeList = useAppSelector((state) => state.shoppingList.activeList);
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productQuantity, setProductQuantity] = useState(defaultProductQuantity);
  const [productUnitPrice, setProductUnitPrice] = useState("");
  const [productError, setProductError] = useState<string | null>(null);
  const [isClearConfirmationVisible, setIsClearConfirmationVisible] =
    useState(false);
  const [isCompleteConfirmationVisible, setIsCompleteConfirmationVisible] =
    useState(false);
  const [isCreateListModalVisible, setIsCreateListModalVisible] =
    useState(false);
  const [isEditListNameModalVisible, setIsEditListNameModalVisible] =
    useState(false);
  const [isSelectListModalVisible, setIsSelectListModalVisible] =
    useState(false);
  const [availableLists, setAvailableLists] = useState<ShoppingList[]>([]);
  const [listPendingDeletion, setListPendingDeletion] =
    useState<ShoppingList | null>(null);
  const [isDeletingList, setIsDeletingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListError, setNewListError] = useState<string | null>(null);
  const [editListName, setEditListName] = useState("");
  const [itemPendingRemoval, setItemPendingRemoval] =
    useState<ShoppingListItem | null>(null);
  const [itemPendingSectionChange, setItemPendingSectionChange] =
    useState<ShoppingListItem | null>(null);
  const [itemPendingQuantityEdit, setItemPendingQuantityEdit] =
    useState<ShoppingListItem | null>(null);
  const [quantityEditValue, setQuantityEditValue] = useState(defaultProductQuantity);
  const [unitPriceEditValue, setUnitPriceEditValue] = useState("");
  const [quantityEditError, setQuantityEditError] = useState<string | null>(null);
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const addItemUseCase = useMemo(
    () =>
      new AddItemToShoppingListUseCase(
        new ProductCategorizer(defaultCategories),
      ),
    [],
  );

  const sortUseCase = useMemo(
    () => new SortShoppingListByMarketRouteUseCase(),
    [],
  );
  const sections =
    activeList && market ? sortUseCase.execute(activeList, market) : [];
  const totalItems = activeList?.items.length ?? 0;
  const purchasedItems =
    activeList?.items.filter((item) => item.isPurchased).length ?? 0;
  const pendingItems = totalItems - purchasedItems;
  const purchasedTotalCents = useMemo(
    () => activeList?.items.reduce((total, item) => {
      if (!item.isPurchased) {
        return total;
      }

      return total + multiplyCurrencyCents(item.unitPriceCents, item.quantity);
    }, 0) ?? 0,
    [activeList],
  );
  const shouldShowPurchaseTotal = purchasedTotalCents > 0;
  const trimmedProductName = productName.trim();
  const parsedProductQuantity = resolveQuantityInput(productQuantity);
  const isDuplicateProduct = activeList
    ? isProductAlreadyInList(activeList.items, trimmedProductName)
    : false;
  const canAddProduct = Boolean(trimmedProductName) && !isDuplicateProduct;

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadActiveShoppingList() {
        setIsLoading(true);
        setScreenError(null);

        try {
          const marketRepository = await createMarketRepository();
          const shoppingListRepository = await createShoppingListRepository();
          const markets = await marketRepository.getAll();
          const activeMarketId = await marketRepository.getActiveMarketId();
          const fallbackMarket =
            markets.find((item) => item.isDefault) ?? markets[0] ?? null;
          const selectedMarket =
            markets.find((item) => item.id === activeMarketId) ?? fallbackMarket;
          const persistedList = await shoppingListRepository.getActive();
          const allLists = await shoppingListRepository.getAll();

          if (!selectedMarket) {
            throw new Error("Nenhum supermercado cadastrado.");
          }

          let list =
            persistedList ??
            (await shoppingListRepository.createActive(
              selectedMarket.id,
              defaultShoppingListName,
            ));

          if (list.marketId !== selectedMarket.id) {
            list = {
              ...list,
              marketId: selectedMarket.id,
              updatedAt: new Date().toISOString(),
            };
            await shoppingListRepository.update(list);
          }

          if (!isMounted) {
            return;
          }

          setAvailableLists(
            allLists.filter((currentList) => currentList.status !== "completed"),
          );
          setMarket(selectedMarket);
          dispatch(setSelectedMarketId(selectedMarket.id));
          dispatch(setActiveList(list));
        } catch (error) {
          if (!isMounted) {
            return;
          }

          const message =
            error instanceof Error
              ? error.message
              : "Não foi possível carregar a lista.";
          setScreenError(message);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

      void loadActiveShoppingList();

      return () => {
        isMounted = false;
      };
    }, [dispatch]),
  );

  function handleProductNameChange(value: string) {
    setProductName(value);

    if (productError) {
      setProductError(null);
    }
  }

  function handleProductQuantityChange(value: string) {
    setProductQuantity(sanitizeQuantityInput(value));

    if (productError) {
      setProductError(null);
    }
  }

  function handleProductQuantityBlur() {
    setProductQuantity(formatQuantityValue(resolveQuantityInput(productQuantity)));
  }

  function handleProductUnitPriceChange(value: string) {
    setProductUnitPrice(maskCurrencyInput(value));

    if (productError) {
      setProductError(null);
    }
  }

  async function handleAddItem() {
    if (!trimmedProductName || !activeList || !market || isSaving) {
      return;
    }

    if (isProductAlreadyInList(activeList.items, trimmedProductName)) {
      setProductError("Este produto já está na lista.");
      return;
    }

    setIsSaving(true);
    setProductQuantity(formatQuantityValue(parsedProductQuantity));

    try {
      const shoppingListRepository = await createShoppingListRepository();
      const preferenceRepository =
        await createUserProductPreferenceRepository();
      const updatedList = addItemUseCase.execute({
        list: activeList,
        productName: trimmedProductName,
        quantity: parsedProductQuantity,
        unit: defaultProductUnit,
      });

      const generatedItem = updatedList.items[updatedList.items.length - 1];
      const preference = await preferenceRepository.getPreference(
        generatedItem.normalizedName,
        market.id,
      );
      const typedUnitPriceCents = parseCurrencyInputToCents(productUnitPrice);
      const latestUnitPriceCents = typedUnitPriceCents
        ?? await shoppingListRepository.getLatestUnitPriceCentsByProduct(generatedItem.normalizedName);
      const newItem: ShoppingListItem = {
        ...(preference
          ? {
              ...generatedItem,
              sectionName: preference.preferredSectionName,
              updatedAt: new Date().toISOString(),
            }
          : generatedItem),
        ...(typeof latestUnitPriceCents === "number" ? { unitPriceCents: latestUnitPriceCents } : {}),
      };

      await shoppingListRepository.addItem(newItem);

      dispatch(addShoppingListItem(newItem));
      setProductName("");
      setProductQuantity(defaultProductQuantity);
      setProductUnitPrice("");
      setProductError(null);
      Keyboard.dismiss();
    } catch {
      setProductError("Não foi possível salvar este produto. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleItem(itemId: string) {
    if (!activeList || isSaving) {
      return;
    }

    const item = activeList.items.find(
      (currentItem) => currentItem.id === itemId,
    );

    if (!item) {
      return;
    }

    setIsSaving(true);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      await shoppingListRepository.updateItemPurchaseStatus(
        itemId,
        !item.isPurchased,
      );
      dispatch(toggleShoppingListItemPurchased(itemId));
    } finally {
      setIsSaving(false);
    }
  }

  function handleRequestRemoveItem(item: ShoppingListItem) {
    if (isSaving) {
      return;
    }

    setItemPendingRemoval(item);
  }

  function handleCancelRemoveItem() {
    if (isSaving) {
      return;
    }

    setItemPendingRemoval(null);
  }

  async function handleConfirmRemoveItem() {
    if (!itemPendingRemoval || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      await shoppingListRepository.removeItem(itemPendingRemoval.id);
      dispatch(removeShoppingListItem(itemPendingRemoval.id));
      setItemPendingRemoval(null);
    } finally {
      setIsSaving(false);
    }
  }

  function handleRequestChangeItemSection(item: ShoppingListItem) {
    if (isSaving) {
      return;
    }

    setItemPendingSectionChange(item);
  }

  function handleCancelChangeItemSection() {
    if (isSaving) {
      return;
    }

    setItemPendingSectionChange(null);
  }

  async function handleConfirmChangeItemSection(sectionName: string) {
    if (!itemPendingSectionChange || !market || isSaving) {
      return;
    }

    if (itemPendingSectionChange.sectionName === sectionName) {
      setItemPendingSectionChange(null);
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date().toISOString();
      const shoppingListRepository = await createShoppingListRepository();
      const preferenceRepository =
        await createUserProductPreferenceRepository();

      await shoppingListRepository.updateItemSection(
        itemPendingSectionChange.id,
        sectionName,
      );
      await preferenceRepository.savePreference({
        id: createId(),
        productNormalizedName: itemPendingSectionChange.normalizedName,
        preferredSectionName: sectionName,
        marketId: market.id,
        updatedAt: now,
      });

      dispatch(
        updateShoppingListItemSection({
          itemId: itemPendingSectionChange.id,
          sectionName,
          updatedAt: now,
        }),
      );
      setItemPendingSectionChange(null);
    } finally {
      setIsSaving(false);
    }
  }

  function handleRequestEditItemQuantity(item: ShoppingListItem) {
    if (isSaving) {
      return;
    }

    setItemPendingQuantityEdit(item);
    setQuantityEditValue(formatQuantityValue(item.quantity));
    setUnitPriceEditValue(formatCurrencyCents(item.unitPriceCents));
    setQuantityEditError(null);
  }

  function handleCancelEditItemQuantity() {
    if (isSaving) {
      return;
    }

    setItemPendingQuantityEdit(null);
    setQuantityEditValue(defaultProductQuantity);
    setUnitPriceEditValue("");
    setQuantityEditError(null);
  }

  function handleQuantityEditValueChange(value: string) {
    setQuantityEditValue(sanitizeQuantityInput(value));

    if (quantityEditError) {
      setQuantityEditError(null);
    }
  }

  function handleQuantityEditBlur() {
    setQuantityEditValue(formatQuantityValue(resolveQuantityInput(quantityEditValue)));
  }

  function handleUnitPriceEditValueChange(value: string) {
    setUnitPriceEditValue(maskCurrencyInput(value));

    if (quantityEditError) {
      setQuantityEditError(null);
    }
  }

  async function handleConfirmEditItemQuantity() {
    if (!itemPendingQuantityEdit || !activeList || isSaving) {
      return;
    }

    const parsedQuantity = resolveQuantityInput(quantityEditValue);
    const unitPriceCents = parseCurrencyInputToCents(unitPriceEditValue);
    const now = new Date().toISOString();

    setIsSaving(true);
    setQuantityEditValue(formatQuantityValue(parsedQuantity));
    setQuantityEditError(null);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      const updatedItem: ShoppingListItem = {
        ...itemPendingQuantityEdit,
        quantity: parsedQuantity,
        unit: defaultProductUnit,
        updatedAt: now,
      };

      if (typeof unitPriceCents === "number" && Number.isFinite(unitPriceCents) && unitPriceCents > 0) {
        updatedItem.unitPriceCents = Math.trunc(unitPriceCents);
      } else {
        delete updatedItem.unitPriceCents;
      }

      const updatedList: ShoppingList = {
        ...activeList,
        items: activeList.items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item,
        ),
        updatedAt: now,
      };

      await shoppingListRepository.update(updatedList);
      dispatch(setActiveList(updatedList));

      setItemPendingQuantityEdit(null);
      setQuantityEditValue(defaultProductQuantity);
      setUnitPriceEditValue("");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRequestSelectList() {
    if (isSaving) {
      return;
    }

    try {
      const shoppingListRepository = await createShoppingListRepository();
      const lists = await shoppingListRepository.getAll();
      setAvailableLists(
        lists.filter((currentList) => currentList.status !== "completed"),
      );
      setIsSelectListModalVisible(true);
    } catch {
      setScreenError("Não foi possível carregar suas listas.");
    }
  }

  function handleCancelSelectList() {
    if (isSaving) {
      return;
    }

    setIsSelectListModalVisible(false);
  }

  async function handleConfirmSelectList(list: ShoppingList) {
    if (isSaving || list.id === activeList?.id) {
      setIsSelectListModalVisible(false);
      return;
    }

    setIsSaving(true);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      const marketRepository = await createMarketRepository();
      const selectedList = await shoppingListRepository.setActive(list.id);
      const selectedMarket = await marketRepository.getById(list.marketId);

      if (!selectedList || !selectedMarket) {
        throw new Error("Lista ou supermercado não encontrado.");
      }

      await marketRepository.setActiveMarketId(selectedMarket.id);
      dispatch(setSelectedMarketId(selectedMarket.id));
      dispatch(setActiveList(selectedList));
      setMarket(selectedMarket);
      setIsSelectListModalVisible(false);
    } catch {
      setScreenError("Não foi possível selecionar esta lista.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleRequestDeleteList(list: ShoppingList) {
    if (isSaving || isDeletingList) {
      return;
    }

    setListPendingDeletion(list);
  }

  function handleCancelDeleteList() {
    if (isDeletingList) {
      return;
    }

    setListPendingDeletion(null);
  }

  async function handleConfirmDeleteList() {
    if (!listPendingDeletion || isSaving || isDeletingList || !market) {
      return;
    }

    setIsDeletingList(true);
    setScreenError(null);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      const marketRepository = await createMarketRepository();
      const deletedListId = listPendingDeletion.id;

      await shoppingListRepository.deleteList(deletedListId);

      let openLists = (await shoppingListRepository.getAll()).filter(
        (currentList) => currentList.status !== "completed",
      );

      if (activeList?.id === deletedListId) {
        let nextActiveList: ShoppingList | null = null;

        if (openLists.length > 0) {
          nextActiveList =
            (await shoppingListRepository.setActive(openLists[0].id)) ?? openLists[0];
        } else {
          nextActiveList = await shoppingListRepository.createActive(
            market.id,
            defaultShoppingListName,
          );
          openLists = [nextActiveList];
        }

        const selectedMarket = await marketRepository.getById(nextActiveList.marketId);

        if (selectedMarket) {
          await marketRepository.setActiveMarketId(selectedMarket.id);
          dispatch(setSelectedMarketId(selectedMarket.id));
          setMarket(selectedMarket);
        }

        dispatch(setActiveList(nextActiveList));
      }

      setAvailableLists(openLists);
      setListPendingDeletion(null);
    } catch {
      setScreenError("Não foi possível apagar esta lista.");
    } finally {
      setIsDeletingList(false);
    }
  }

  function handleRequestCreateList() {
    if (isSaving) {
      return;
    }

    setNewListName("");
    setNewListError(null);
    setIsCreateListModalVisible(true);
  }

  function handleCancelCreateList() {
    if (isSaving) {
      return;
    }

    setIsCreateListModalVisible(false);
    setNewListName("");
    setNewListError(null);
  }

  async function handleConfirmCreateList() {
    if (!market || isSaving) {
      return;
    }

    const resolvedName = resolveShoppingListName(newListName);

    setIsSaving(true);
    setNewListError(null);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      const newList = await shoppingListRepository.createActive(
        market.id,
        resolvedName,
      );
      dispatch(setActiveList(newList));
      setAvailableLists((currentLists) => [
        newList,
        ...currentLists.filter((currentList) => currentList.id !== newList.id),
      ]);
      setIsCreateListModalVisible(false);
      setNewListName("");
    } catch {
      setNewListError("Não foi possível criar a lista. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleRequestEditListName() {
    if (!activeList || isSaving) {
      return;
    }

    setEditListName(activeList.name);
    setIsEditListNameModalVisible(true);
  }

  function handleCancelEditListName() {
    if (isSaving) {
      return;
    }

    setIsEditListNameModalVisible(false);
    setEditListName("");
  }

  async function handleConfirmEditListName() {
    if (!activeList || isSaving) {
      return;
    }

    const resolvedName = resolveShoppingListName(editListName);

    if (resolvedName === activeList.name) {
      setIsEditListNameModalVisible(false);
      setEditListName("");
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date().toISOString();
      const shoppingListRepository = await createShoppingListRepository();
      const updatedList: ShoppingList = {
        ...activeList,
        name: resolvedName,
        updatedAt: now,
      };

      await shoppingListRepository.update(updatedList);
      dispatch(setActiveList(updatedList));
      setAvailableLists((currentLists) =>
        currentLists.map((list) =>
          list.id === updatedList.id ? updatedList : list,
        ),
      );
      setIsEditListNameModalVisible(false);
      setEditListName("");
    } finally {
      setIsSaving(false);
    }
  }

  function handleRequestCompleteList() {
    if (!activeList || totalItems === 0 || isSaving) {
      return;
    }

    setIsCompleteConfirmationVisible(true);
  }

  function handleCancelCompleteList() {
    if (isSaving) {
      return;
    }

    setIsCompleteConfirmationVisible(false);
  }

  async function handleConfirmCompleteList() {
    if (!activeList || !market || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      await shoppingListRepository.completeList(activeList.id);
      const newList = await shoppingListRepository.createActive(
        market.id,
        defaultShoppingListName,
      );
      dispatch(setActiveList(newList));
      setAvailableLists((currentLists) => [
        newList,
        ...currentLists.filter((currentList) => currentList.id !== activeList.id),
      ]);
      setProductError(null);
      setProductName("");
      setProductQuantity(defaultProductQuantity);
      setIsCompleteConfirmationVisible(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleRequestClearList() {
    setIsClearConfirmationVisible(true);
  }

  function handleCancelClearList() {
    setIsClearConfirmationVisible(false);
  }

  async function handleConfirmClearList() {
    if (!activeList || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const shoppingListRepository = await createShoppingListRepository();
      await shoppingListRepository.clearItems(activeList.id);
      dispatch(clearActiveShoppingList());
      setProductError(null);
      setIsClearConfirmationVisible(false);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppScreen
        bottomNavigation={false}
        contentStyle={styles.centeredContainer}
      >
        <ActivityIndicator color={theme.colors.primary} />
        <AppText muted style={styles.loadingText}>
          Carregando lista...
        </AppText>
      </AppScreen>
    );
  }

  if (screenError) {
    return (
      <AppScreen contentStyle={styles.centeredContainer}>
        <AppCard elevated style={styles.errorCard}>
          <AppText variant="subtitle">
            Não foi possível carregar a lista
          </AppText>
          <AppText muted style={styles.errorText}>
            {screenError}
          </AppText>
        </AppCard>
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
          title={activeList.name}
          description={market.name}
        />

        <View style={styles.content}>
          <View style={styles.summaryRow}>
            <SummaryPill label="Pendentes" value={pendingItems} />
            <SummaryPill label="Comprados" value={purchasedItems} />
            <SummaryPill label="Total" value={totalItems} />
          </View>

          {shouldShowPurchaseTotal ? (
            <AppCard elevated style={styles.purchaseTotalCard}>
              <AppText variant="label" accent>Total no carrinho</AppText>
              <AppText variant="headline" style={styles.purchaseTotalValue}>
                {formatCurrencyCents(purchasedTotalCents)}
              </AppText>
              <AppText muted style={styles.purchaseTotalHint}>
                Soma dos itens marcados como comprados com preço informado.
              </AppText>
            </AppCard>
          ) : null}

          <View style={styles.activeListActions}>
            <Pressable
              onPress={handleRequestCreateList}
              style={({ pressed }) => [
                styles.listActionButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.listActionButtonText}>
                Nova
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleRequestEditListName}
              style={({ pressed }) => [
                styles.listActionButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.listActionButtonText}>
                Nome
              </AppText>
            </Pressable>

            <Pressable
              onPress={handleRequestSelectList}
              style={({ pressed }) => [
                styles.listActionButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.listActionButtonText}>
                Trocar
              </AppText>
            </Pressable>

            <Pressable
              disabled={totalItems === 0 || isSaving}
              onPress={handleRequestCompleteList}
              style={({ pressed }) => [
                styles.listActionButton,
                styles.completeListButton,
                totalItems === 0 || isSaving ? styles.disabledActionButton : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.completeListButtonText}>
                Concluir
              </AppText>
            </Pressable>
          </View>

          <AppCard elevated style={styles.formCard}>
            <View style={styles.formHeader}>
              <View>
                <AppText variant="label" accent>
                  Adicionar produto
                </AppText>
                <AppText muted style={styles.formSubtitle}>
                  Digite um item por vez. Informe quantidade e, se quiser,
                  preço unitário.
                </AppText>
              </View>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                value={productName}
                onChangeText={handleProductNameChange}
                placeholder="Ex.: arroz, banana, leite"
                placeholderTextColor={theme.colors.textSubtle}
                style={styles.input}
                returnKeyType="next"
                autoCorrect={false}
              />

              <View style={styles.productDetailsRow}>
                <TextInput
                  value={productQuantity}
                  onChangeText={handleProductQuantityChange}
                  placeholder="Qtde"
                  placeholderTextColor={theme.colors.textSubtle}
                  style={[styles.input, styles.quantityInput]}
                  keyboardType="number-pad"
                  returnKeyType="next"
                  onBlur={handleProductQuantityBlur}
                />

                <TextInput
                  value={productUnitPrice}
                  onChangeText={handleProductUnitPriceChange}
                  placeholder="Preço unit."
                  placeholderTextColor={theme.colors.textSubtle}
                  style={[styles.input, styles.priceInput]}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={handleAddItem}
                />
              </View>
            </View>

            {isDuplicateProduct || productError ? (
              <AppText variant="caption" style={styles.validationMessage}>
                {productError ?? "Este produto já está na lista."}
              </AppText>
            ) : null}

            <AppButton
              style={styles.addButton}
              disabled={!canAddProduct || isSaving}
              onPress={handleAddItem}
            >
              {isSaving ? "Salvando..." : "Adicionar à lista"}
            </AppButton>
          </AppCard>

          {sections.length === 0 ? (
            <EmptyShoppingList />
          ) : (
            <View style={styles.sectionsContainer}>
              <View style={styles.listHeader}>
                <View style={styles.listHeaderTextContainer}>
                  <AppText variant="label" accent>
                    Rota de compra
                  </AppText>
                  <AppText muted style={styles.listHint}>
                    Itens comprados ficam no final de cada corredor.
                  </AppText>
                </View>

                <Pressable
                  onPress={handleRequestClearList}
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <AppText variant="caption" style={styles.clearButtonText}>
                    Limpar
                  </AppText>
                </Pressable>
              </View>

              {sections.map((section, index) => (
                <AppCard
                  key={section.sectionName}
                  elevated
                  style={styles.section}
                >
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionOrder}>
                      <AppText
                        variant="caption"
                        style={styles.sectionOrderText}
                      >
                        {index + 1}
                      </AppText>
                    </View>
                    <View style={styles.sectionTextContainer}>
                      <AppText variant="subtitle" style={styles.sectionTitle}>
                        {section.sectionName}
                      </AppText>
                      <AppText subtle variant="caption">
                        {section.items.length} item
                        {section.items.length === 1 ? "" : "s"}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.itemsContainer}>
                    {section.items.map((item) => (
                      <ShoppingItemRow
                        key={item.id}
                        item={item}
                        onToggle={() => handleToggleItem(item.id)}
                        onChangeSection={() =>
                          handleRequestChangeItemSection(item)
                        }
                        onEditQuantity={() =>
                          handleRequestEditItemQuantity(item)
                        }
                        onRemove={() => handleRequestRemoveItem(item)}
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

      <SelectShoppingListModal
        visible={isSelectListModalVisible}
        lists={availableLists}
        activeListId={activeList.id}
        onCancel={handleCancelSelectList}
        onSelectList={handleConfirmSelectList}
        onRequestDeleteList={handleRequestDeleteList}
      />

      <ConfirmDeleteShoppingListModal
        visible={Boolean(listPendingDeletion)}
        listName={listPendingDeletion?.name ?? ""}
        isDeleting={isDeletingList}
        onCancel={handleCancelDeleteList}
        onConfirm={handleConfirmDeleteList}
      />

      <CreateShoppingListModal
        visible={isCreateListModalVisible}
        value={newListName}
        error={newListError}
        isSaving={isSaving}
        onChangeValue={(value) => {
          setNewListName(value);
          if (newListError) {
            setNewListError(null);
          }
        }}
        onCancel={handleCancelCreateList}
        onConfirm={handleConfirmCreateList}
      />

      <EditShoppingListNameModal
        visible={isEditListNameModalVisible}
        value={editListName}
        isSaving={isSaving}
        onChangeValue={setEditListName}
        onCancel={handleCancelEditListName}
        onConfirm={handleConfirmEditListName}
      />

      <ConfirmCompleteListModal
        visible={isCompleteConfirmationVisible}
        listName={activeList.name}
        totalItems={totalItems}
        onCancel={handleCancelCompleteList}
        onConfirm={handleConfirmCompleteList}
      />

      <ConfirmRemoveItemModal
        visible={Boolean(itemPendingRemoval)}
        itemName={itemPendingRemoval?.name ?? ""}
        onCancel={handleCancelRemoveItem}
        onConfirm={handleConfirmRemoveItem}
      />

      <EditItemQuantityModal
        visible={Boolean(itemPendingQuantityEdit)}
        itemName={itemPendingQuantityEdit?.name ?? ""}
        quantityValue={quantityEditValue}
        unitPriceValue={unitPriceEditValue}
        error={quantityEditError}
        onChangeQuantity={handleQuantityEditValueChange}
        onBlurQuantity={handleQuantityEditBlur}
        onChangeUnitPrice={handleUnitPriceEditValueChange}
        onCancel={handleCancelEditItemQuantity}
        onConfirm={handleConfirmEditItemQuantity}
      />

      <ChangeItemSectionModal
        visible={Boolean(itemPendingSectionChange)}
        itemName={itemPendingSectionChange?.name ?? ""}
        currentSectionName={itemPendingSectionChange?.sectionName ?? ""}
        sections={market.sections
          .filter((section) => section.isActive)
          .sort((left, right) => left.routeOrder - right.routeOrder)
          .map((section) => section.name)}
        onCancel={handleCancelChangeItemSection}
        onSelectSection={handleConfirmChangeItemSection}
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
      <AppText variant="headline" style={styles.summaryValue}>
        {value}
      </AppText>
      <AppText subtle variant="caption" style={styles.summaryLabel}>
        {label}
      </AppText>
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
        Adicione produtos para montar a primeira rota de compra. Itens como
        banana, arroz, leite e detergente já serão agrupados por corredor.
      </AppText>
    </AppCard>
  );
}

interface SelectShoppingListModalProps {
  visible: boolean;
  lists: ShoppingList[];
  activeListId: string;
  onCancel: () => void;
  onSelectList: (list: ShoppingList) => void;
  onRequestDeleteList: (list: ShoppingList) => void;
}

function SelectShoppingListModal({
  visible,
  lists,
  activeListId,
  onCancel,
  onSelectList,
  onRequestDeleteList,
}: SelectShoppingListModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, styles.sectionModalCard]}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Trocar lista
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Escolha qual lista deseja continuar comprando.
          </AppText>

          <ScrollView
            style={styles.sectionOptions}
            contentContainerStyle={styles.sectionOptionsContent}
          >
            {lists.length === 0 ? (
              <AppText muted>Nenhuma lista aberta encontrada.</AppText>
            ) : null}

            {lists.map((list) => {
              const isSelected = list.id === activeListId;

              return (
                <View
                  key={list.id}
                  style={[
                    styles.sectionOption,
                    styles.sectionOptionRow,
                    isSelected ? styles.sectionOptionSelected : null,
                  ]}
                >
                  <Pressable
                    onPress={() => onSelectList(list)}
                    style={({ pressed }) => [
                      styles.sectionOptionSelectArea,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <View style={styles.sectionOptionTextContainer}>
                      <AppText style={styles.sectionOptionName}>
                        {list.name}
                      </AppText>
                      <AppText variant="caption" accent={isSelected} subtle={!isSelected}>
                        {isSelected ? "Lista atual" : `${list.items.length} item${list.items.length === 1 ? "" : "s"}`}
                      </AppText>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => onRequestDeleteList(list)}
                    style={({ pressed }) => [
                      styles.sectionDeleteButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <AppText variant="caption" style={styles.sectionDeleteButtonText}>
                      Apagar
                    </AppText>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ConfirmDeleteShoppingListModalProps {
  visible: boolean;
  listName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDeleteShoppingListModal({
  visible,
  listName,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteShoppingListModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Apagar lista?
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Você está prestes a apagar "{listName}". Essa ação não poderá ser
            desfeita.
          </AppText>

          <View style={styles.modalActions}>
            <Pressable
              disabled={isDeleting}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              disabled={isDeleting}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalDangerButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalDangerText}>
                {isDeleting ? "Apagando..." : "Apagar"}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface CreateShoppingListModalProps {
  visible: boolean;
  value: string;
  error: string | null;
  isSaving: boolean;
  onChangeValue: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function CreateShoppingListModal({
  visible,
  value,
  error,
  isSaving,
  onChangeValue,
  onCancel,
  onConfirm,
}: CreateShoppingListModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Nova lista
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Crie uma lista separada para uma compra específica. Se não informar
            um nome, usaremos "Compra do dia".
          </AppText>

          <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder="Ex.: Compra do dia"
            placeholderTextColor={theme.colors.textSubtle}
            style={[styles.input, styles.modalInput]}
            returnKeyType="done"
            onSubmitEditing={onConfirm}
            autoCorrect={false}
          />

          {error ? (
            <AppText variant="caption" style={styles.validationMessage}>
              {error}
            </AppText>
          ) : null}

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              disabled={isSaving}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalPrimaryButton,
                isSaving ? styles.disabledActionButton : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalPrimaryText}>
                Criar lista
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface EditShoppingListNameModalProps {
  visible: boolean;
  value: string;
  isSaving: boolean;
  onChangeValue: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function EditShoppingListNameModal({
  visible,
  value,
  isSaving,
  onChangeValue,
  onCancel,
  onConfirm,
}: EditShoppingListNameModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Editar nome da lista
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Altere o nome para identificar melhor esta compra. Se salvar vazio,
            usaremos "Compra do dia".
          </AppText>

          <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder="Compra do dia"
            placeholderTextColor={theme.colors.textSubtle}
            style={[styles.input, styles.modalInput]}
            returnKeyType="done"
            onSubmitEditing={onConfirm}
            autoCorrect={false}
          />

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              disabled={isSaving}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalPrimaryButton,
                isSaving ? styles.disabledActionButton : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalPrimaryText}>
                Salvar
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ConfirmCompleteListModalProps {
  visible: boolean;
  listName: string;
  totalItems: number;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmCompleteListModal({
  visible,
  listName,
  totalItems,
  onCancel,
  onConfirm,
}: ConfirmCompleteListModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Concluir compra?
          </AppText>
          <AppText muted style={styles.modalDescription}>
            A lista "{listName}" será enviada para o histórico com {totalItems}
            item{totalItems === 1 ? "" : "s"}. Em seguida, uma nova lista vazia
            será criada automaticamente.
          </AppText>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalPrimaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalPrimaryText}>
                Concluir
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ConfirmClearListModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmClearListModal({
  visible,
  onCancel,
  onConfirm,
}: ConfirmClearListModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Limpar lista?
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Essa ação remove todos os produtos da lista atual. Use apenas quando
            realmente quiser começar uma nova compra.
          </AppText>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalDangerButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalDangerText}>
                Limpar lista
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ConfirmRemoveItemModalProps {
  visible: boolean;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmRemoveItemModal({
  visible,
  itemName,
  onCancel,
  onConfirm,
}: ConfirmRemoveItemModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Remover produto?
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Você está prestes a remover "{itemName}" da lista. Essa ação não
            poderá ser desfeita.
          </AppText>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalDangerButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalDangerText}>
                Remover
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ChangeItemSectionModalProps {
  visible: boolean;
  itemName: string;
  currentSectionName: string;
  sections: string[];
  onCancel: () => void;
  onSelectSection: (sectionName: string) => void;
}

function ChangeItemSectionModal({
  visible,
  itemName,
  currentSectionName,
  sections,
  onCancel,
  onSelectSection,
}: ChangeItemSectionModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, styles.sectionModalCard]}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Alterar corredor
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Escolha onde "{itemName}" deve aparecer neste supermercado. O app
            lembrará essa escolha nas próximas inclusões.
          </AppText>

          <ScrollView
            style={styles.sectionOptions}
            contentContainerStyle={styles.sectionOptionsContent}
          >
            {sections.map((sectionName) => {
              const isSelected = sectionName === currentSectionName;

              return (
                <Pressable
                  key={sectionName}
                  onPress={() => onSelectSection(sectionName)}
                  style={({ pressed }) => [
                    styles.sectionOption,
                    isSelected ? styles.sectionOptionSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <View style={styles.sectionOptionTextContainer}>
                    <AppText style={styles.sectionOptionName}>
                      {sectionName}
                    </AppText>
                    {isSelected ? (
                      <AppText variant="caption" accent>
                        Corredor atual
                      </AppText>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface EditItemQuantityModalProps {
  visible: boolean;
  itemName: string;
  quantityValue: string;
  unitPriceValue: string;
  error: string | null;
  onChangeQuantity: (value: string) => void;
  onBlurQuantity: () => void;
  onChangeUnitPrice: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function EditItemQuantityModal({
  visible,
  itemName,
  quantityValue,
  unitPriceValue,
  error,
  onChangeQuantity,
  onBlurQuantity,
  onChangeUnitPrice,
  onCancel,
  onConfirm,
}: EditItemQuantityModalProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <AppText variant="subtitle" style={styles.modalTitle}>
            Editar produto
          </AppText>
          <AppText muted style={styles.modalDescription}>
            Ajuste a quantidade e o preço unitário de "{itemName}".
          </AppText>

          <View style={styles.modalQuantityBlock}>
            <View style={styles.modalInputGroup}>
              <AppText variant="caption" style={styles.modalInputLabel}>Quantidade</AppText>
              <TextInput
                value={quantityValue}
                onChangeText={onChangeQuantity}
                placeholder="1"
                placeholderTextColor={theme.colors.textSubtle}
                style={[styles.input, styles.modalQuantityInput]}
                keyboardType="number-pad"
                returnKeyType="next"
                onBlur={onBlurQuantity}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <AppText variant="caption" style={styles.modalInputLabel}>Preço unitário</AppText>
              <TextInput
                value={unitPriceValue}
                onChangeText={onChangeUnitPrice}
                placeholder="Opcional"
                placeholderTextColor={theme.colors.textSubtle}
                style={[styles.input, styles.modalQuantityInput]}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={onConfirm}
              />
            </View>
          </View>

          {error ? (
            <AppText variant="caption" style={styles.validationMessage}>
              {error}
            </AppText>
          ) : null}

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalCancelButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalCancelText}>
                Cancelar
              </AppText>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                styles.modalPrimaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <AppText variant="caption" style={styles.modalPrimaryText}>
                Salvar
              </AppText>
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
  onChangeSection: () => void;
  onEditQuantity: () => void;
  onRemove: () => void;
}

function ShoppingItemRow({
  item,
  onToggle,
  onChangeSection,
  onEditQuantity,
  onRemove,
}: ShoppingItemRowProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View
      style={[
        styles.itemRow,
        item.isPurchased ? styles.itemRowPurchased : null,
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.isPurchased }}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.checkArea,
          pressed ? styles.pressed : null,
        ]}
      >
        <View
          style={[
            styles.checkbox,
            item.isPurchased ? styles.checkboxChecked : null,
          ]}
        >
          {item.isPurchased ? <View style={styles.checkboxInner} /> : null}
        </View>
      </Pressable>

      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.itemTextArea,
          pressed ? styles.pressed : null,
        ]}
      >
        <AppText
          style={[
            styles.itemName,
            item.isPurchased ? styles.itemNamePurchased : null,
          ]}
        >
          {formatItemName(item)}
        </AppText>
        <AppText variant="caption" subtle style={styles.itemQuantityText}>
          {item.isPurchased ? "Comprado" : "Pendente"}
        </AppText>
        {item.unitPriceCents ? (
          <View style={styles.itemPriceContainer}>
            <AppText variant="caption" style={styles.itemPriceText}>
              {formatCurrencyCents(item.unitPriceCents)} unitário
            </AppText>
            <AppText variant="caption" style={styles.itemPriceText}>
              {formatCurrencyCents(multiplyCurrencyCents(item.unitPriceCents, item.quantity))} total
            </AppText>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.itemActions}>
        <Pressable
          onPress={onChangeSection}
          style={({ pressed }) => [
            styles.itemActionButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <AppText variant="caption" style={styles.itemActionButtonText}>
            Corredor
          </AppText>
        </Pressable>

        <Pressable
          onPress={onEditQuantity}
          style={({ pressed }) => [
            styles.itemActionButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <AppText variant="caption" style={styles.itemActionButtonText}>
            Editar
          </AppText>
        </Pressable>

        <Pressable
          onPress={onRemove}
          style={({ pressed }) => [
            styles.itemActionButton,
            styles.itemRemoveActionButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <AppText variant="caption" style={styles.removeButtonText}>
            Remover
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function sanitizeQuantityInput(rawValue: string): string {
  return rawValue.replace(/\D/g, "");
}

function resolveQuantityInput(rawValue: string): number {
  const sanitizedValue = sanitizeQuantityInput(rawValue);

  if (!sanitizedValue) {
    return 1;
  }

  const parsedValue = Number.parseInt(sanitizedValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function formatQuantityValue(quantity: number): string {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return defaultProductQuantity;
  }

  return String(Math.trunc(quantity));
}

function formatItemName(item: ShoppingListItem): string {
  const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;

  if (quantity === 1) {
    return item.name;
  }

  const quantityText = Number.isInteger(quantity)
    ? String(quantity)
    : quantity.toLocaleString("pt-BR", { maximumFractionDigits: 3 });

  return `${quantityText}x ${item.name}`;
}

function createStyles(theme: ReturnType<typeof useAppTheme>) {
  return StyleSheet.create({
    centeredContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
    },
    loadingText: {
      marginTop: theme.spacing.md,
    },
    content: {
      padding: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    errorCard: {
      width: "100%",
      padding: theme.spacing.xl,
    },
    errorText: {
      marginTop: theme.spacing.sm,
    },
    summaryRow: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    summaryPill: {
      flex: 1,
      minHeight: 74,
      justifyContent: "center",
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: theme.mode === "dark" ? 0.14 : 0.06,
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
      fontWeight: "700",
    },
    purchaseTotalCard: {
      padding: theme.spacing.lg,
    },
    purchaseTotalValue: {
      marginTop: theme.spacing.xs,
      color: theme.colors.primary,
    },
    purchaseTotalHint: {
      marginTop: theme.spacing.xs,
      fontSize: 13,
      lineHeight: 18,
    },
    activeListActions: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    listActionButton: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceElevated,
      paddingHorizontal: theme.spacing.md,
    },
    listActionButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: "900",
    },
    completeListButton: {
      backgroundColor: theme.colors.primary,
    },
    completeListButtonText: {
      color: theme.colors.primaryText,
      fontWeight: "900",
    },
    disabledActionButton: {
      opacity: 0.48,
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
    productDetailsRow: {
      flexDirection: "row",
      alignItems: "stretch",
      width: "100%",
      gap: theme.spacing.sm,
    },
    quantityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    quantityInput: {
      flex: 0,
      width: 88,
      minWidth: 76,
      paddingHorizontal: theme.spacing.sm,
      textAlign: "center",
    },
    priceInput: {
      flex: 1,
      minWidth: 0,
      paddingHorizontal: theme.spacing.md,
      textAlign: "center",
    },
    unitOptions: {
      gap: theme.spacing.xs,
      alignItems: "center",
      paddingRight: theme.spacing.sm,
    },
    unitOption: {
      minHeight: 38,
      minWidth: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.sm,
    },
    unitOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft,
    },
    unitOptionText: {
      color: theme.colors.textMuted,
      fontWeight: "900",
    },
    unitOptionTextSelected: {
      color: theme.colors.primaryStrong,
      fontWeight: "900",
    },
    input: {
      minWidth: 0,
      minHeight: 54,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
      backgroundColor: theme.colors.inputBackground,
    },
    validationMessage: {
      marginTop: theme.spacing.sm,
      color: theme.mode === "dark" ? "#FCA5A5" : "#B91C1C",
      fontWeight: "800",
    },
    addButton: {
      marginTop: theme.spacing.md,
      width: "100%",
    },
    emptyCard: {
      position: "relative",
      overflow: "hidden",
      padding: theme.spacing.xl,
    },
    emptyAccent: {
      position: "absolute",
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.sm,
    },
    listHeaderTextContainer: {
      flex: 1,
      minWidth: 0,
      paddingRight: theme.spacing.sm,
    },
    listHint: {
      marginTop: 2,
      fontSize: 13,
      lineHeight: 18,
    },
    clearButton: {
      minHeight: 34,
      flexShrink: 0,
      justifyContent: "center",
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surfaceElevated,
    },
    clearButtonText: {
      color: theme.colors.primary,
      fontWeight: "900",
    },
    section: {
      padding: 0,
      overflow: "hidden",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    sectionOrder: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primarySoft,
    },
    sectionOrderText: {
      color: theme.colors.primaryStrong,
      fontWeight: "900",
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
      flexDirection: "row",
      alignItems: "center",
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
      alignItems: "center",
      justifyContent: "center",
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: theme.colors.borderStrong,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
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
      justifyContent: "center",
    },
    itemName: {
      fontWeight: "800",
      textTransform: "capitalize",
    },
    itemNamePurchased: {
      textDecorationLine: "line-through",
      color: theme.colors.textSubtle,
    },
    itemQuantityText: {
      marginTop: 2,
      fontWeight: "800",
    },
    itemPriceContainer: {
      marginTop: 4,
      gap: 1,
    },
    itemPriceText: {
      color: theme.colors.primaryStrong,
      fontWeight: "900",
      lineHeight: 18,
    },
    itemActions: {
      width: 94,
      gap: 6,
    },
    itemActionButton: {
      minHeight: 32,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.xs,
      backgroundColor: theme.colors.primarySoft,
    },
    itemRemoveActionButton: {
      backgroundColor: theme.colors.backgroundAlt,
    },
    itemActionButtonText: {
      color: theme.colors.primaryStrong,
      fontWeight: "900",
    },
    removeButtonText: {
      color: theme.colors.textMuted,
      fontWeight: "900",
    },
    modalOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: theme.spacing.xl,
      backgroundColor:
        theme.mode === "dark"
          ? "rgba(2, 6, 23, 0.78)"
          : "rgba(15, 23, 42, 0.34)",
    },
    modalCard: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.xl,
      padding: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: theme.mode === "dark" ? 0.42 : 0.18,
      shadowRadius: 30,
      elevation: 8,
    },
    sectionModalCard: {
      maxHeight: "82%",
    },
    modalTitle: {
      color: theme.colors.text,
    },
    modalDescription: {
      marginTop: theme.spacing.sm,
      lineHeight: 22,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },
    modalButton: {
      minHeight: 42,
      justifyContent: "center",
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
    },
    modalCancelButton: {
      backgroundColor: theme.colors.surfaceMuted,
    },
    modalPrimaryButton: {
      backgroundColor: theme.colors.primary,
    },
    modalPrimaryText: {
      color: theme.colors.primaryText,
      fontWeight: "900",
    },
    modalInput: {
      marginTop: theme.spacing.lg,
    },
    modalQuantityBlock: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    modalInputGroup: {
      gap: theme.spacing.xs,
    },
    modalInputLabel: {
      color: theme.colors.textMuted,
      fontWeight: "900",
    },
    modalQuantityInput: {
      width: "100%",
      textAlign: "center",
    },
    modalUnitGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    modalDangerButton: {
      backgroundColor: theme.mode === "dark" ? "#7F1D1D" : "#FEE2E2",
    },
    modalCancelText: {
      color: theme.colors.textMuted,
      fontWeight: "900",
    },
    modalDangerText: {
      color: theme.mode === "dark" ? "#FECACA" : "#B91C1C",
      fontWeight: "900",
    },
    sectionOptions: {
      marginTop: theme.spacing.lg,
      maxHeight: 360,
    },
    sectionOptionsContent: {
      gap: theme.spacing.sm,
      paddingBottom: theme.spacing.sm,
    },
    sectionOption: {
      minHeight: 54,
      justifyContent: "center",
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceMuted,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    sectionOptionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
    },
    sectionOptionSelectArea: {
      flex: 1,
      minHeight: 50,
      justifyContent: "center",
    },
    sectionDeleteButton: {
      minHeight: 34,
      justifyContent: "center",
      borderRadius: theme.radius.md,
      backgroundColor: theme.mode === "dark" ? "#3F1D1D" : "#FEE2E2",
      paddingHorizontal: theme.spacing.md,
    },
    sectionDeleteButtonText: {
      color: theme.mode === "dark" ? "#FECACA" : "#B91C1C",
      fontWeight: "900",
    },
    sectionOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft,
    },
    sectionOptionTextContainer: {
      gap: 2,
    },
    sectionOptionName: {
      fontWeight: "900",
    },
    pressed: {
      opacity: 0.72,
    },
  });
}
