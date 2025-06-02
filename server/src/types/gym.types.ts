import { Document } from 'mongoose';
import { TSubscriptionStatus } from '@shared/types/subscription.types.js';
import { IUser } from './user.types.js';
import { IAddress } from '@shared/types/gym.types.js';

export interface IGym extends Document {
  name: string;
  address: IAddress;
  phoneNumber: string | null;
  email: string | null;
  isActive: boolean;
  subscriptionStatus: TSubscriptionStatus;
  subscriptionEndDate: Date;
  logo: {
    url: string;
    path: string;
  } | null;
  website: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  getMembers(): Promise<IUser[]>;
  getInstructors(): Promise<IUser[]>;
  getAdmins(): Promise<IUser[]>;
}
