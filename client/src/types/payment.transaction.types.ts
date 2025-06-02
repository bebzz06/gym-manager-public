import {
  TPaymentMethod,
  TPaymentStatus,
  TPaymentTransactionType,
} from '@shared/types/payment.types';

export interface IGetPaymentTransactionsParams {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: TPaymentMethod;
  status?: TPaymentStatus;
  type?: TPaymentTransactionType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cursor?: string;
  limit?: number;
}
