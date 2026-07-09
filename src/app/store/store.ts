import { configureStore } from '@reduxjs/toolkit';
import shoppingListReducer from './slices/shoppingListSlice';
import marketReducer from './slices/marketSlice';
import themeReducer from '../../application/state/theme/themeSlice';

export const store = configureStore({
  reducer: {
    shoppingList: shoppingListReducer,
    market: marketReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
