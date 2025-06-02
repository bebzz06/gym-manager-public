import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProfileState } from '@/types/store.types';
import { Belt } from '@shared/constants/user';

const initialState: IProfileState = {
  id: '',
  email: '',
  role: null,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  profileImage: null,
  phoneNumber: '',
  emergencyContact: {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    relationship: '',
  },
  paymentHistory: {
    payments: [],
    hasPayments: false,
    pagination: {
      cursor: null,
      limit: 10,
      hasMore: false,
    },
  },
  activeMembershipPlan: {
    plan: null,
    payment: null,
  },
  rank: {
    belt: Belt.WHITE,
    stripes: 0,
  },
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfileStart: state => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<Partial<IProfileState>>) => {
      return { ...state, ...action.payload, loading: false, error: null };
    },
    updateProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearProfileData: () => initialState,
  },
});

export const { updateProfileStart, updateProfileSuccess, updateProfileFailure, clearProfileData } =
  profileSlice.actions;

export default profileSlice.reducer;
