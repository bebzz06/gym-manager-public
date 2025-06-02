import { TPaymentTransactionType } from '@shared/types/payment.types.js';

export interface CreatePagueloFacilPaymentParams {
  purchasedItemId: string;
  purchasedItemType: TPaymentTransactionType;
  paymentBy: string;
}

export interface CreatePagueloFacilPaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl: string;
}
