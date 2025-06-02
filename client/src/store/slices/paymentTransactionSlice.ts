import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPaymentTransactionData } from '@shared/types/payment.types';
import { IPaymentTransactionsState } from '@/types/store.types';
import { WritableDraft } from 'immer';
const initialState: IPaymentTransactionsState = {
  transactions: [],
  loading: false,
  filters: {},
  sorting: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    cursor: null,
    limit: 10,
    hasMore: true, //allows for infinite scroll
  },
  error: null,
};

const paymentTransactionSlice = createSlice({
  name: 'paymentTransactions',
  initialState,
  reducers: {
    fetchPaymentTransactionsStart: state => {
      state.loading = true;
      state.error = null;
    },
    fetchPaymentTransactionsSuccess: (state, action: PayloadAction<IPaymentTransactionData[]>) => {
      state.transactions = action.payload as WritableDraft<IPaymentTransactionData>[];
      state.loading = false;
      state.error = null;
    },
    fetchPaymentTransactionsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearPaymentTransactionsError: state => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.cursor = null; // Reset pagination when filters change
    },
    setSorting: (state, action: PayloadAction<typeof initialState.sorting>) => {
      state.sorting = action.payload;
      state.pagination.cursor = null; // Reset pagination when sorting changes
    },
    setPagination: (state, action: PayloadAction<typeof initialState.pagination>) => {
      state.pagination = action.payload;
    },
  },
});

export const {
  fetchPaymentTransactionsStart,
  fetchPaymentTransactionsSuccess,
  fetchPaymentTransactionsFailure,
  clearPaymentTransactionsError,
  setFilters,
  setSorting,
  setPagination,
} = paymentTransactionSlice.actions;

export default paymentTransactionSlice.reducer;
