import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ThemeMode } from '../../../app/theme/AppTheme';
import { getStoredThemeMode, saveThemeMode } from './themeStorage';

interface ThemeState {
  mode: ThemeMode;
  isLoaded: boolean;
}

const initialState: ThemeState = {
  mode: 'light',
  isLoaded: false,
};

export const loadThemeMode = createAsyncThunk('theme/loadThemeMode', async () => {
  const storedThemeMode = await getStoredThemeMode();
  return storedThemeMode ?? 'light';
});

export const persistThemeMode = createAsyncThunk(
  'theme/persistThemeMode',
  async (themeMode: ThemeMode) => {
    await saveThemeMode(themeMode);
    return themeMode;
  },
);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    toggleThemeMode(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadThemeMode.fulfilled, (state, action) => {
        state.mode = action.payload;
        state.isLoaded = true;
      })
      .addCase(loadThemeMode.rejected, (state) => {
        state.mode = 'light';
        state.isLoaded = true;
      })
      .addCase(persistThemeMode.fulfilled, (state, action) => {
        state.mode = action.payload;
      });
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
