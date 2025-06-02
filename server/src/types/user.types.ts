import { Document, Types, Model } from 'mongoose';
import { TUserRole, TBelt, TKidsBelt, TAgeCategory } from '@shared/types/user.types.js';
import { IGym } from './gym.types.js';
import { TSubscriptionStatus } from '@shared/types/subscription.types.js';
import { IPaymentTransaction } from './payment.transaction.types.js';
import { TSortOrder } from '@shared/types/sort.types.js';
import { TValidSortField } from '@shared/types/sort.types.js';

export interface IUser extends Document {
  gym: Types.ObjectId;
  firstName: string;
  lastName: string;
  profileImage: {
    url: string;
    path: string;
  } | null;
  email: string;
  password: string | null;
  role: TUserRole;
  phoneNumber: string | null;

  // New fields for age-related functionality
  dateOfBirth: Date;
  guardian?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relationship: string;
  };

  emergencyContact: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relationship: string;
  };

  // Modified rank to support both belt systems
  rank: {
    belt: TBelt | TKidsBelt;
    stripes: number;
  };

  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  tokenVersion: number; //track token version when forced logout. Used for change password and email.
  emailVerification?: {
    token: string;
    expiresAt: Date;
    isUsed: boolean;
  };
  isEmailVerified: boolean;
  passwordReset?: {
    token: string;
    expiresAt: Date;
    isUsed: boolean;
  };

  activeMembershipPlan: {
    plan: Types.ObjectId | null;
    payment: Types.ObjectId | null;
  };

  // Virtual properties
  age: number | null;
  ageCategory: TAgeCategory | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: Types.ObjectId | null;

  // Methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  getGymInfo(): Promise<IGym | null>;
  getAgeCategory(): TAgeCategory;
  getMembershipInfo(): Promise<IMembershipInfo>;
  getPaymentHistory(options?: {
    limit?: number;
    cursor?: string;
    sortBy?: TValidSortField;
    sortOrder?: TSortOrder;
  }): Promise<{
    payments: TPaymentHistoryItem[];
    hasPayments: boolean;
    pagination: {
      cursor: string | null;
      limit: number;
      hasMore: boolean;
    };
  }>;
}

export interface IUserModel extends Model<IUser> {
  findPotentialGuardian(email: string): Promise<IUser | null>;
}

type TPaymentHistoryItem = Partial<IPaymentTransaction> & {
  purchasedItem: {
    name: string;
    description: string;
  };
};
export interface IMembershipInfo {
  status: TSubscriptionStatus | null;
  endDate: Date | null;
  lastPayment: Date | null;
  plan: {
    id: Types.ObjectId;
    name: string;
  } | null;
}
