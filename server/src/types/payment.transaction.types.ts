import {
  TPaymentStatus,
  TPaymentMethod,
  TPaymentTransactionType,
  TPaymentCurrency,
} from '@shared/types/payment.types.js';
import { TSubscriptionStatus } from '@shared/types/subscription.types.js';
import { Document, Types } from 'mongoose';

export interface IInvoiceItem {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  taxable: boolean;
}

export interface IRefund {
  amount: number;
  date: Date;
  reason?: string;
  processedBy: Types.ObjectId;
  metadata?: Record<string, any>;
}

interface ISubscriptionInfo {
  isSubscription: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: TSubscriptionStatus;
  renewalDate?: Date | string;
  cancelledAt?: Date | string;
}

export interface IPaymentTransaction extends Document {
  gym: Types.ObjectId;
  type: TPaymentTransactionType;
  purchasedItem: Types.ObjectId;
  paymentBy: Types.ObjectId;
  amount: number;
  currency: TPaymentCurrency;
  paymentMethod: TPaymentMethod;
  status: TPaymentStatus;
  invoicing: {
    receiptNumber: string;
    invoiceNumber: string;
    invoiceDate: Date;
    taxAmount: number;
    taxRate: number;
    items: IInvoiceItem[];
  };
  metadata?: Record<string, any>;
  receivedBy: Types.ObjectId | null;
  notes?: string;
  refunds: IRefund[];
  subscription: ISubscriptionInfo;
  expiresAt?: Date;
}
interface PopulatedUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

interface PopulatedReceiver {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}
export interface IPopulatedTransaction extends Document {
  _id: Types.ObjectId;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  type: string;
  paymentBy: PopulatedUser;
  receivedBy?: PopulatedReceiver;
  invoicing: {
    receiptNumber: string;
    invoiceNumber: string;
    invoiceDate: Date;
    taxAmount: number;
    taxRate: number;
    items: IInvoiceItem[];
  };
  notes?: string;
  subscription: ISubscriptionInfo;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ISanitizedTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  type: string;
  paymentBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  receivedBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  invoicing: {
    receiptNumber: string;
    invoiceNumber: string;
    invoiceDate: Date | string;
    taxAmount: number;
    taxRate: number;
    items: IInvoiceItem[];
  };
  subscription: ISubscriptionInfo;
  createdAt: Date | string;
  notes?: string;
  metadata?: Record<string, any>;
}
