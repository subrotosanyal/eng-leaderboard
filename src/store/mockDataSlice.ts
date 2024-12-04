import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

interface MockDataState {
  isMockData: boolean;
}

const initialState: MockDataState = {
  isMockData: false,
};

export const mockDataSlice = createSlice({
  name: 'mockData',
  initialState,
  reducers: {
    setIsMockData: (state, action: PayloadAction<boolean>) => {
      state.isMockData = action.payload;
    },
  },
});

export const { setIsMockData } = mockDataSlice.actions;
export const selectIsMockData = (state: RootState) => state.mockData.isMockData;
export default mockDataSlice.reducer;
