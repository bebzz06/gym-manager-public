import { createSlice } from '@reduxjs/toolkit';
import { IAuthState } from '@/types/store.types';

const initialState: IAuthState = {
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuthStart: state => {
      state.loading = true;
      state.error = null;
    },
    initializeAuthSuccess: state => {
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      console.log('Auth initialized successfully:', state.isAuthenticated);
    },
    initializeAuthFailure: state => {
      state.loading = false;
      state.error = null;
      console.log('Auth initialization failed');
    },
    loginStart: state => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: state => {
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
    refreshFailure: (state, action) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload || 'Session expired. Please sign in again.';
    },
    logoutStart: state => {
      state.loading = true;
      state.error = null;
    },
    logoutSuccess: state => {
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    logoutFailure: (state, action) => {
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload || 'Logout failed';
    },
    clearLoginFailure: state => {
      state.error = null;
    },
  },
});

export const {
  initializeAuthStart,
  initializeAuthSuccess,
  initializeAuthFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  refreshFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  clearLoginFailure,
} = authSlice.actions;
export default authSlice.reducer;
