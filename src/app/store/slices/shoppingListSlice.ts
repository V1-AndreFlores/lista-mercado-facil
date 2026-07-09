import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { ShoppingList } from '../../../domain/entities/ShoppingList';

interface ShoppingListState {
  activeList: ShoppingList | null;
  isLoading: boolean;
}

const initialState: ShoppingListState = {
  activeList: null,
  isLoading: false,
};

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
  },
});

export const { setActiveList, setShoppingListLoading } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
