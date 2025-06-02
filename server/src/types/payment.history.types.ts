import { TValidSortField } from '@shared/types/sort.types.js';
import { TSortOrder } from '@shared/types/sort.types.js';
import { IPaymentTransaction } from './payment.transaction.types.js';

export interface IPaymentHistoryOptions {
  limit?: number;
  cursor?: string;
  sortBy?: TValidSortField;
  sortOrder?: TSortOrder;
}

export interface IPaginationResponse {
  cursor: string | null;
  limit: number;
  hasMore: boolean;
}

export interface IPaymentHistoryResponse {
  payments: IPaymentTransaction[];
  hasPayments: boolean;
  pagination: IPaginationResponse;
}
