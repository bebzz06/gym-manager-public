import { TSubscriptionInterval } from '@shared/types/subscription.types';
import { TMembershipType } from '@shared/types/user.types';
import { TPaymentMethodSettings } from '@shared/types/payment.types';

export interface IMembershipPlanData {
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
  paymentMethodSettings: TPaymentMethodSettings;
}
