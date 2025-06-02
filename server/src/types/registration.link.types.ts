import { Document, Types } from 'mongoose';
import { TLinkStatus } from '@shared/types/registration.link.types.js';
import { IAddress } from '@shared/types/gym.types.js';

export interface IUserPopulated {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}
export interface IGymPopulated {
  _id: Types.ObjectId;
  name: string;
  address: IAddress;
}
export interface IRegistrationLink extends Document {
  gym: Types.ObjectId | IGymPopulated;
  expiresAt: Date;
  usageCount: number;
  maxUses: number | null;
  createdBy: Types.ObjectId | IUserPopulated;
  token: string;
  createdAt: Date;
  status: TLinkStatus;
  revokedBy: Types.ObjectId | IUserPopulated | null;
  revokedAt: Date | null;
}
export interface ILinkValidationResult {
  link: IRegistrationLink | null;
  error?: string;
}
