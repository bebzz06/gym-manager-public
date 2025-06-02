import {
  TAgeCategory,
  TBelt,
  TEmergencyContactRelationshipToMember,
  TKidsBelt,
  TUserRole,
} from '@shared/types/user.types';
import { IEmergencyContact } from './profile.types';
import { TSubscriptionStatus } from '@shared/types/subscription.types';

//self registration not used
export interface IUserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
//not used
export interface IUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

//admin create user

export interface IUserCreateData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ISelfRegistrationData extends IMemberCreateData {
  token: string;
}
export interface ISelfRegistrationResponse {
  message: string;
  user: {
    email: string;
  };
}
export interface IMemberCreateData {
  firstName: string;
  lastName: string;
  password?: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  role?: TUserRole;
  guardian?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relationship: TEmergencyContactRelationshipToMember;
  };
  emergencyContact?: IEmergencyContact;
}
export interface IMemberUpdateData extends IMemberCreateData {
  rank: {
    belt: TBelt | TKidsBelt;
    stripes: number;
  };
}

export interface IPaymentHistoryItem {
  _id: string;
  amount: number;
  currency: string;
  type: string;
  createdAt: string;
  purchasedItem: {
    name: string;
    description: string;
  };
}
export interface IPaymentHistory {
  payments: IPaymentHistoryItem[];
  hasPayments: boolean;
  pagination: {
    cursor: string | null;
    limit: number;
    hasMore: boolean;
  };
}

interface IProfileImage {
  url: string;
  path: string;
}
export interface IMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: IProfileImage | null;
  rank: {
    stripes: number;
    belt: TBelt | TKidsBelt;
  };
  isEmailVerified: boolean;
  phoneNumber?: string;
  dateOfBirth?: string;
  createdBy?: string;
  role: TUserRole;
  createdAt?: string;
  updatedAt?: string;
  age?: number;
  ageCategory?: TAgeCategory;
  emergencyContact?: IEmergencyContact;
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
  paymentHistory?: IPaymentHistory;
}
