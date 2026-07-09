import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface MarketState {
  selectedMarketId: string | null;
}

const initialState: MarketState = {
  selectedMarketId: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setSelectedMarketId(state, action: PayloadAction<string | null>) {
      state.selectedMarketId = action.payload;
    },
  },
});

export const { setSelectedMarketId } = marketSlice.actions;
export default marketSlice.reducer;
