import { configureStore } from '@reduxjs/toolkit';
import shoppingListReducer from './slices/shoppingListSlice';
import marketReducer from './slices/marketSlice';

export const store = configureStore({
  reducer: {
    shoppingList: shoppingListReducer,
    market: marketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
