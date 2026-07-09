import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ShoppingList } from '../../../domain/entities/ShoppingList';
import { ShoppingListItem } from '../../../domain/entities/ShoppingListItem';
import { isProductAlreadyInList } from '../../../domain/services/ShoppingListDuplicateGuard';

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
  name: 'shoppingList',
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

      const item = state.activeList.items.find((currentItem) => currentItem.id === action.payload);

      if (!item) {
        return;
      }

      item.isPurchased = !item.isPurchased;
      item.updatedAt = new Date().toISOString();
      updateListTimestamp(state.activeList);
    },
    removeShoppingListItem(state, action: PayloadAction<string>) {
      if (!state.activeList) {
        return;
      }

      state.activeList.items = state.activeList.items.filter((item) => item.id !== action.payload);
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
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;
