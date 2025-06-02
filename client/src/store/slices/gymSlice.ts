import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IGymState } from '@/types/store.types';
import { SubscriptionStatus } from '@shared/constants/subscription';

const initialState: IGymState = {
  id: '',
  name: '',
  email: null,
  address: null,
  phoneNumber: null,
  subscriptionStatus: SubscriptionStatus.TRIAL,
  subscriptionEndDate: '',
  isActive: true,
  logo: null,
  website: null,
  description: null,
  loading: false, // loading state used for uploading and deleting logo
  error: null,
};

const gymSlice = createSlice({
  name: 'gym',
  initialState,
  reducers: {
    setGymData: (state, action: PayloadAction<Partial<IGymState>>) => {
      return { ...state, ...action.payload };
    },
    clearGymData: () => initialState,
    updateGymProfile: (state, action: PayloadAction<Partial<IGymState>>) => {
      return { ...state, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setGymData, clearGymData, updateGymProfile, setLoading, setError } =
  gymSlice.actions;
export default gymSlice.reducer;
