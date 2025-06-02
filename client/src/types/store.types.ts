import { store } from '@/store';
import { TUserRole, TBelt, TEmergencyContactRelationshipToMember } from '@shared/types/user.types';
import { TSubscriptionStatus } from '@shared/types/subscription.types';
import { IMember, IPaymentHistory } from './user.types';
import { IRegistrationLink } from '@/types/registration.link.types';
import { IMembershipPlanData } from './membership.plan.types';
import {
  IPaymentTransactionData,
  TPaymentMethod,
  TPaymentStatus,
  TPaymentTransactionType,
} from '@shared/types/payment.types';
import { WritableDraft } from 'immer';
import { ISortParams } from '@shared/types/sort.types';
import { IAddress } from '@shared/types/gym.types';
export interface IAuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
export interface IProfileState {
  id: string;
  email: string;
  role: TUserRole | null;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  profileImage: {
    url: string;
    path: string;
  } | null;
  phoneNumber: string;
  emergencyContact: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relationship: TEmergencyContactRelationshipToMember | string;
  };
  activeMembershipPlan?: {
    plan: string | null;
    payment: string | null;
  };
  membershipInfo?: {
    status?: TSubscriptionStatus;
    endDate?: string;
    lastPayment?: string;
    plan?: {
      id: string;
      name: string;
    };
  };
  paymentHistory: IPaymentHistory;
  rank: {
    belt: TBelt;
    stripes: number;
  };
  loading: boolean;
  error: string | null;
}
export interface IGymState {
  id: string;
  name: string;
  email: string | null;
  address: IAddress | null;
  phoneNumber: string | null;
  subscriptionStatus: TSubscriptionStatus;
  subscriptionEndDate: string;
  isActive: boolean;
  logo: {
    url: string;
    path: string;
  } | null;
  website: string | null;
  description: string | null;
  loading: boolean;
  error: string | null;
}

export interface IMembersState {
  members: IMember[];
  loading: boolean;
  error: string | null;
}
export interface MemberDetailsState {
  member: IMember | null;
  loading: boolean;
  error: string | null;
}
export interface IAppState {
  isInitialized: boolean;
}

export interface IRegistrationLinksState {
  registrationLinks: IRegistrationLink[];
  loading: boolean;
  error: string | null;
}

export interface IMembershipPlan extends IMembershipPlanData {
  id: string;
  itemType: TPaymentTransactionType;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
export interface IMembershipPlansState {
  plans: IMembershipPlan[];
  loading: boolean;
  error: string | null;
}

export interface IPaymentTransactionsState {
  transactions: WritableDraft<IPaymentTransactionData>[];
  loading: boolean;
  error: string | null;
  filters: {
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    paymentMethod?: TPaymentMethod;
    status?: TPaymentStatus;
    type?: TPaymentTransactionType;
  };
  sorting: ISortParams;
  pagination: {
    cursor: string | null;
    limit: number;
    hasMore: boolean;
  };
}

// Infer the `RootState` type from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Infer the `AppDispatch` type from the store
export type AppDispatch = typeof store.dispatch;
