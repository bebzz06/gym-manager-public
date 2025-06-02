import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import gymReducer from './slices/gymSlice';
import membersReducer from './slices/membersSlice';
import memberDetailsReducer from './slices/memberDetailsSlice';
import appReducer from './slices/appSlice';
import registrationLinksReducer from './slices/registrationLinksSlice';
import membershipPlansReducer from './slices/membershipPlansSlice';
import paymentTransactionsReducer from './slices/paymentTransactionSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    gym: gymReducer,
    members: membersReducer,
    memberDetails: memberDetailsReducer,
    app: appReducer,
    registrationLinks: registrationLinksReducer,
    membershipPlans: membershipPlansReducer,
    paymentTransactions: paymentTransactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
