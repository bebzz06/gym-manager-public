import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IMembershipPlan, IMembershipPlansState } from '@/types/store.types';
const initialState: IMembershipPlansState = {
  plans: [],
  loading: false,
  error: null,
};

const membershipPlansSlice = createSlice({
  name: 'membershipPlans',
  initialState,
  reducers: {
    fetchMembershipPlansStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchMembershipPlansSuccess: (state, action: PayloadAction<IMembershipPlan[]>) => {
      state.plans = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchMembershipPlansFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addMembershipPlan: (state, action: PayloadAction<IMembershipPlan>) => {
      state.plans.push(action.payload);
    },
    updateMembershipPlan: (state, action: PayloadAction<IMembershipPlan>) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    deleteMembershipPlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
    },
    clearMembershipPlansError: state => {
      state.error = null;
    },
  },
});

export const {
  fetchMembershipPlansStart,
  fetchMembershipPlansSuccess,
  fetchMembershipPlansFailure,
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  clearMembershipPlansError,
} = membershipPlansSlice.actions;

export default membershipPlansSlice.reducer;
