import httpClient from '@/http';
import { API_ENDPOINTS } from '@/constants/routes';
import { IGetPaymentTransactionsParams } from '@/types/payment.transaction.types';

export const getPaymentTransactions = async (params: IGetPaymentTransactionsParams) => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.PAYMENT_TRANSACTION.GET_ALL, {
      params,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error fetching payment transactions');
  }
};
