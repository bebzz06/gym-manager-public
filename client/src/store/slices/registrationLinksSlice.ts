import { IRegistrationLink } from '@/types/registration.link.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IRegistrationLinksState } from '@/types/store.types';

const initialState: IRegistrationLinksState = {
  registrationLinks: [],
  loading: false,
  error: null,
};

const registrationLinksSlice = createSlice({
  name: 'registrationLinks',
  initialState,
  reducers: {
    fetchRegistrationLinksStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchRegistrationLinksSuccess: (state, action: PayloadAction<IRegistrationLink[]>) => {
      state.registrationLinks = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchRegistrationLinksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.registrationLinks = [];
      state.error = action.payload;
    },
  },
});

export const {
  fetchRegistrationLinksStart,
  fetchRegistrationLinksSuccess,
  fetchRegistrationLinksFailure,
} = registrationLinksSlice.actions;

export default registrationLinksSlice.reducer;
