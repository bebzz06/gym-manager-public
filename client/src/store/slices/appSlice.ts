import { IAppState } from '@/types/store.types';
import { createSlice } from '@reduxjs/toolkit';

const initialState: IAppState = {
  isInitialized: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    initializeSuccess: state => {
      state.isInitialized = true;
    },
  },
});

export const { initializeSuccess } = appSlice.actions;
export default appSlice.reducer;
