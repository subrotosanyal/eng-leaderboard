import { configureStore } from '@reduxjs/toolkit';
import mockDataReducer from './mockDataSlice';

export const store = configureStore({
  reducer: {
    mockData: mockDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
