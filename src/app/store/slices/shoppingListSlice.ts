import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ShoppingList } from "../../../domain/entities/ShoppingList";
import { ShoppingListItem } from "../../../domain/entities/ShoppingListItem";
import { isProductAlreadyInList } from "../../../domain/services/ShoppingListDuplicateGuard";

interface ShoppingListState {
  activeList: ShoppingList | null;
  isLoading: boolean;
}

const initialState: ShoppingListState = {
  activeList: null,
  isLoading: false,
};

function updateListTimestamp(list: ShoppingList): void {
  list.updatedAt = new Date().toISOString();
}

const shoppingListSlice = createSlice({
  name: "shoppingList",
  initialState,
  reducers: {
    setActiveList(state, action: PayloadAction<ShoppingList | null>) {
      state.activeList = action.payload;
    },
    setShoppingListLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    addShoppingListItem(state, action: PayloadAction<ShoppingListItem>) {
      if (!state.activeList) {
        return;
      }

      if (isProductAlreadyInList(state.activeList.items, action.payload.name)) {
        return;
      }

      state.activeList.items.push(action.payload);
      updateListTimestamp(state.activeList);
    },
    toggleShoppingListItemPurchased(state, action: PayloadAction<string>) {
      if (!state.activeList) {
        return;
      }

      const item = state.activeList.items.find(
        (currentItem) => currentItem.id === action.payload,
      );

      if (!item) {
        return;
      }

      item.isPurchased = !item.isPurchased;
      item.updatedAt = new Date().toISOString();
      updateListTimestamp(state.activeList);
    },

    updateShoppingListItemSection(
      state,
      action: PayloadAction<{
        itemId: string;
        sectionName: string;
        updatedAt?: string;
      }>,
    ) {
      if (!state.activeList) {
        return;
      }

      const item = state.activeList.items.find(
        (currentItem) => currentItem.id === action.payload.itemId,
      );

      if (!item) {
        return;
      }

      const updatedAt = action.payload.updatedAt ?? new Date().toISOString();
      item.sectionName = action.payload.sectionName;
      item.updatedAt = updatedAt;
      updateListTimestamp(state.activeList);
    },
    updateShoppingListItemQuantityAndUnit(
      state,
      action: PayloadAction<{
        itemId: string;
        quantity: number;
        unit: string;
        updatedAt?: string;
      }>,
    ) {
      if (!state.activeList) {
        return;
      }

      const item = state.activeList.items.find(
        (currentItem) => currentItem.id === action.payload.itemId,
      );

      if (!item) {
        return;
      }

      const updatedAt = action.payload.updatedAt ?? new Date().toISOString();
      item.quantity = action.payload.quantity > 0 ? action.payload.quantity : 1;
      item.unit = action.payload.unit as typeof item.unit;
      item.updatedAt = updatedAt;
      updateListTimestamp(state.activeList);
    },
    updateShoppingListItemUnitPrice(
      state,
      action: PayloadAction<{
        itemId: string;
        unitPriceCents?: number;
        updatedAt?: string;
      }>,
    ) {
      if (!state.activeList) {
        return;
      }

      const item = state.activeList.items.find(
        (currentItem) => currentItem.id === action.payload.itemId,
      );

      if (!item) {
        return;
      }

      const updatedAt = action.payload.updatedAt ?? new Date().toISOString();
      const unitPriceCents = action.payload.unitPriceCents;

      if (typeof unitPriceCents === "number" && Number.isFinite(unitPriceCents) && unitPriceCents > 0) {
        item.unitPriceCents = Math.trunc(unitPriceCents);
      } else {
        delete item.unitPriceCents;
      }

      item.updatedAt = updatedAt;
      updateListTimestamp(state.activeList);
    },
    removeShoppingListItem(state, action: PayloadAction<string>) {
      if (!state.activeList) {
        return;
      }

      state.activeList.items = state.activeList.items.filter(
        (item) => item.id !== action.payload,
      );
      updateListTimestamp(state.activeList);
    },
    clearActiveShoppingList(state) {
      if (!state.activeList) {
        return;
      }

      state.activeList.items = [];
      updateListTimestamp(state.activeList);
    },
  },
});

export const {
  addShoppingListItem,
  clearActiveShoppingList,
  removeShoppingListItem,
  setActiveList,
  setShoppingListLoading,
  toggleShoppingListItemPurchased,
  updateShoppingListItemSection,
  updateShoppingListItemQuantityAndUnit,
  updateShoppingListItemUnitPrice,
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;
