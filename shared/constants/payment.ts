export const PaymentCurrencies = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  CZK: 'CZK',
} as const;

export const PaymentTransactionTypes = {
  MEMBERSHIP_PLAN: 'MembershipPlan', //match to model name
  // MERCHANDISE: 'Merchandise',
  // FOOD_AND_BEVERAGE: 'FoodAndBeverage',
} as const;

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  EXPIRED: 'EXPIRED',
} as const;

export const PaymentProcessors = {
  PAGUELO_FACIL: 'pagueloFacil',
} as const;

export const PaymentMethods = {
  ...PaymentProcessors,
  CASH: 'cash',
} as const;

export const PAYMENT_EXPIRATION_MINUTES = 10;
