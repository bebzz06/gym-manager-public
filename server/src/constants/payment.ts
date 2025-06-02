import { PaymentTransactionTypes } from '@shared/constants/payment.js';
import MembershipPlan from '@/models/MembershipPlan.model.js';

export const PAYMENT_TYPE_FOR = {
  MembershipPlan: PaymentTransactionTypes.MEMBERSHIP_PLAN,
} as const;

export const MODEL_FOR_PAYMENT_TYPE = {
  [PaymentTransactionTypes.MEMBERSHIP_PLAN]: MembershipPlan,
} as const;
