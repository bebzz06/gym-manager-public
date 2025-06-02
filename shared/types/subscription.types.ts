import { SubscriptionInterval, SubscriptionStatus } from '../constants/subscription.js';

export type TSubscriptionInterval =
  (typeof SubscriptionInterval)[keyof typeof SubscriptionInterval];

export type TSubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
