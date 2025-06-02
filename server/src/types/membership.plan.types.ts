import { Document, Schema } from 'mongoose';
import { TMembershipType } from '@shared/types/user.types.js';
import { TSubscriptionInterval } from '@shared/types/subscription.types.js';
import { TPaymentMethodSettings, TPaymentTransactionType } from '@shared/types/payment.types.js';

export interface IMembershipPlan extends Document {
  gym: Schema.Types.ObjectId;
  itemType: TPaymentTransactionType;
  name: string;
  description?: string;
  category: TMembershipType;
  pricing: {
    amount: number;
    currency: string;
    interval: TSubscriptionInterval;
    intervalCount: number;
    tax: {
      enabled: boolean;
      rate: number;
    };
  };
  features: string[];
  trial: {
    enabled: boolean;
    days: number;
  };
  contractLength: number;
  maxMembers: number | null;
  isActive: boolean;
  paymentMethodSettings: TPaymentMethodSettings;
  createdBy: Schema.Types.ObjectId;
  updatedBy: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}
