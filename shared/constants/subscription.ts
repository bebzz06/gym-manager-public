export const SubscriptionInterval = {
  MINUTE: 'MINUTE',
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
} as const;

export const SubscriptionStatus = {
  PENDING: 'PENDING', // Initial setup, waiting for first payment
  TRIAL: 'TRIAL', // In trial period
  ACTIVE: 'ACTIVE', // Successfully paying and active
  PAST_DUE: 'PAST_DUE', // Payment failed but still trying
  SUSPENDED: 'SUSPENDED', // Temporarily suspended (can be reactivated)
  CANCELLED: 'CANCELLED', // Permanently cancelled by user/admin
  EXPIRED: 'EXPIRED', // Reached end date or failed to renew
} as const;
