import { createSlice } from '@reduxjs/toolkit';
import { MemberDetailsState } from '@/types/store.types';

const initialState: MemberDetailsState = {
  member: null,
  loading: false,
  error: null,
};

const memberDetailsSlice = createSlice({
  name: 'memberDetails',
  initialState,
  reducers: {
    fetchMemberStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchMemberSuccess: (state, action) => {
      state.loading = false;
      state.member = action.payload;
      state.error = null;
    },
    fetchMemberFailure: (state, action) => {
      state.loading = false;
      state.member = null;
      state.error = action.payload;
    },
    clearMemberDetails: state => {
      state.member = null;
      state.error = null;
      state.loading = false;
    },
    updateMemberStart: state => {
      state.loading = true;
      state.error = null;
    },
    updateMemberSuccess: (state, action) => {
      state.loading = false;
      state.member = action.payload;
      state.error = null;
    },
    updateMemberFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchMemberStart,
  fetchMemberSuccess,
  fetchMemberFailure,
  clearMemberDetails,
  updateMemberStart,
  updateMemberSuccess,
  updateMemberFailure,
} = memberDetailsSlice.actions;

export default memberDetailsSlice.reducer;
