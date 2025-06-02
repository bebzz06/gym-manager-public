import { SubscriptionInterval } from '@shared/constants/subscription.js';
import { TSubscriptionInterval } from '@shared/types/subscription.types.js';
import moment from 'moment-timezone';

export const calculateEndDate = (
  interval: TSubscriptionInterval,
  intervalCount: number,
  startDate: Date
): Date => {
  const momentDate = moment(startDate);

  switch (interval) {
    case SubscriptionInterval.MINUTE:
      return momentDate.add(intervalCount, 'minutes').toDate();
    case SubscriptionInterval.DAY:
      return momentDate.add(intervalCount, 'days').toDate();
    case SubscriptionInterval.WEEK:
      return momentDate.add(intervalCount, 'weeks').toDate();
    case SubscriptionInterval.MONTH:
      return momentDate.add(intervalCount, 'months').toDate();
    case SubscriptionInterval.YEAR:
      return momentDate.add(intervalCount, 'years').toDate();
  }
};
