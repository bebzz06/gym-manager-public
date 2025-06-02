import {
  PaymentCurrencies,
  PaymentProcessors,
  PaymentStatus,
  PaymentMethods,
  PaymentTransactionTypes,
} from '../constants/payment.js';
import { ISanitizedTransaction } from '../../server/src/types/payment.transaction.types.js';
export type TPaymentCurrency = (typeof PaymentCurrencies)[keyof typeof PaymentCurrencies];

export type TPaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export type TPaymentProcessor = (typeof PaymentProcessors)[keyof typeof PaymentProcessors];

export type TPaymentMethod = (typeof PaymentMethods)[keyof typeof PaymentMethods];

export type TPaymentTransactionType =
  (typeof PaymentTransactionTypes)[keyof typeof PaymentTransactionTypes];

type TCashPaymentSettings = {
  enabled: boolean;
  instructions: string;
};

type TProcessorPaymentSettings = {
  enabled: boolean;
  credentials: Record<string, string>;
};

export type TPaymentMethodSettings = {
  [K in TPaymentMethod]?: K extends typeof PaymentMethods.CASH
    ? TCashPaymentSettings
    : TProcessorPaymentSettings;
};

export interface IPaymentTransactionData extends ISanitizedTransaction {}
