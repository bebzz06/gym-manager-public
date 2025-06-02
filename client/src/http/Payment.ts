import httpClient from '@/http';
import { API_ENDPOINTS } from '@/constants/routes';
import { TPaymentTransactionType } from '@shared/types/payment.types';

interface PagueloFacilPaymentParams {
  purchasedItemId: string;
  purchasedItemType: TPaymentTransactionType;
  paymentBy?: string;
}
interface CashPaymentParams extends PagueloFacilPaymentParams {
  notes: string;
}
export const getPagueloFacilPaymentLink = async ({
  purchasedItemId,
  purchasedItemType,
  paymentBy,
}: PagueloFacilPaymentParams) => {
  const response = await httpClient.post(API_ENDPOINTS.PAYMENT.PAGUELO_FACIL_BUTTON, {
    purchasedItemId,
    purchasedItemType,
    paymentBy,
  });
  return response.data;
};

export const verifyPagueloFacilPayment = async (queryParams: Record<string, string>) => {
  const response = await httpClient.post(API_ENDPOINTS.PAYMENT.PAGUELO_FACIL_VERIFY, {
    queryParams,
  });
  return response.data;
};

export const createCashPayment = async ({
  purchasedItemId,
  purchasedItemType,
  paymentBy,
  notes,
}: CashPaymentParams) => {
  const response = await httpClient.post(API_ENDPOINTS.PAYMENT.CASH_PAYMENT, {
    purchasedItemId,
    purchasedItemType,
    paymentBy,
    notes,
  });
  return response.data;
};

export const confirmCashPayment = async (paymentId: string) => {
  const response = await httpClient.post(API_ENDPOINTS.PAYMENT.CASH_PAYMENT_CONFIRM, {
    paymentId,
  });
  return response.data;
};
