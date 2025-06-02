import { IMember } from '@/types/user.types';
import { IMembersState } from '@/types/store.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: IMembersState = {
  members: [],
  loading: false,
  error: null,
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    fetchMembersStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchMembersSuccess: (state, action: PayloadAction<IMember[]>) => {
      state.members = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchMembersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.members = [];
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { fetchMembersStart, fetchMembersSuccess, fetchMembersFailure } = membersSlice.actions;

export default membersSlice.reducer;
