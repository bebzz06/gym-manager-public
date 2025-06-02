import { calculateEndDate } from '@/utils/index.js';
import { SubscriptionInterval } from '@shared/constants/subscription.js';
import moment from 'moment-timezone';

export const calculateInvoicing = (purchasedItem: any) => {
  const quantity = 1;
  const unitPrice = purchasedItem.pricing.amount;
  const subtotal = unitPrice * quantity;
  const taxAmount = purchasedItem.pricing.tax.enabled
    ? subtotal * purchasedItem.pricing.tax.rate
    : 0;
  const totalAmount = subtotal + taxAmount;

  return { quantity, unitPrice, subtotal, taxAmount, totalAmount };
};

export const calculateSubscription = (purchasedItem: any, gymTimezone: string = 'UTC') => {
  const startDate = moment().tz(gymTimezone).startOf('day').utc().toDate();

  const rawEndDate = calculateEndDate(
    purchasedItem.pricing.interval,
    purchasedItem.pricing.intervalCount,
    startDate
  );

  if (purchasedItem.pricing.interval === SubscriptionInterval.MINUTE) {
    return { startDate, endDate: rawEndDate };
  }

  const endDate = moment(rawEndDate).tz(gymTimezone).startOf('day').utc().toDate();

  return { startDate, endDate };
};
