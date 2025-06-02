import { SubscriptionInterval } from '@shared/constants/subscription.js';
import { MembershipType } from '@shared/constants/user.js';
import { PaymentMethods } from '@shared/constants/payment.js';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateMembershipPlan = (data: any): ValidationResult => {
  const errors: string[] = [];

  // Basic info validation
  validateBasicInfo(data, errors);

  // Pricing validation
  validatePricing(data.pricing, errors);

  // Trial period validation
  validateTrial(data.trial, errors);

  // Contract and membership validation
  validateContractAndMembership(data, errors);

  // Payment methods validation
  validatePaymentMethods(data.paymentMethodSettings, errors);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateBasicInfo = (data: any, errors: string[]) => {
  if (!data.name?.trim()) {
    errors.push('Plan name is required');
  } else if (data.name.length < 2 || data.name.length > 50) {
    errors.push('Plan name must be between 2 and 50 characters');
  }

  if (!data.category) {
    errors.push('Membership category is required');
  } else if (!Object.values(MembershipType).includes(data.category)) {
    errors.push('Invalid membership category');
  }

  // Validate features array if provided
  if (data.features && !Array.isArray(data.features)) {
    errors.push('Features must be an array');
  } else if (data.features?.length > 20) {
    errors.push('Maximum of 20 features allowed');
  }
};

const validatePricing = (pricing: any, errors: string[]) => {
  if (!pricing) {
    errors.push('Pricing information is required');
    return;
  }

  if (typeof pricing.amount !== 'number') {
    errors.push('Price amount must be a number');
  } else if (pricing.amount < 0) {
    errors.push('Price amount cannot be negative');
  } else if (pricing.amount > 10000) {
    errors.push('Price amount exceeds maximum limit');
  }

  if (!Object.values(SubscriptionInterval).includes(pricing.interval)) {
    errors.push('Invalid subscription interval');
  }

  if (pricing.intervalCount) {
    if (pricing.intervalCount < 1) {
      errors.push('Interval count must be at least 1');
    } else if (pricing.intervalCount > 12) {
      errors.push('Interval count cannot exceed 12');
    }
  }

  if (!pricing.currency?.trim()) {
    errors.push('Currency is required');
  } else if (pricing.currency.length !== 3) {
    errors.push('Currency must be a 3-letter ISO code');
  }
};

const validateTrial = (trial: any, errors: string[]) => {
  if (!trial) return;

  if (typeof trial.enabled !== 'boolean') {
    errors.push('Trial enabled must be a boolean');
  }

  if (trial.enabled) {
    if (typeof trial.days !== 'number') {
      errors.push('Trial days must be a number');
    } else if (trial.days < 0) {
      errors.push('Trial days cannot be negative');
    } else if (trial.days > 90) {
      errors.push('Trial period cannot exceed 90 days');
    }
  }
};

const validateContractAndMembership = (data: any, errors: string[]) => {
  // Contract length validation
  if (data.contractLength !== undefined) {
    if (typeof data.contractLength !== 'number') {
      errors.push('Contract length must be a number');
    } else if (data.contractLength < 0) {
      errors.push('Contract length cannot be negative');
    } else if (data.contractLength > 24) {
      errors.push('Contract length cannot exceed 24 months');
    }
  }

  // Max members validation
  if (data.maxMembers !== null && data.maxMembers !== undefined) {
    if (typeof data.maxMembers !== 'number') {
      errors.push('Max members must be a number');
    } else if (data.maxMembers < 0) {
      errors.push('Max members cannot be negative');
    } else if (data.maxMembers > 1000) {
      errors.push('Max members cannot exceed 1000');
    }
  }
};

const validatePaymentMethods = (paymentMethodSettings: any, errors: string[]) => {
  if (!paymentMethodSettings) {
    errors.push('Payment methods configuration is required');
    return;
  }

  // Online payment validation
  const onlinePaymentMethods = Object.values(PaymentMethods).filter(
    method => method !== PaymentMethods.CASH
  );

  // Only validate online payment methods if online payments are enabled
  if (paymentMethodSettings[PaymentMethods.CASH]?.enabled) {
    // Validate cash payment settings
    if (!paymentMethodSettings[PaymentMethods.CASH].instructions?.trim()) {
      errors.push('Cash payment instructions are required when cash payments are enabled');
    }
  }

  // Only validate online processors if any are enabled
  const hasEnabledOnlineProcessor = onlinePaymentMethods.some(
    method => paymentMethodSettings[method]?.enabled
  );

  if (hasEnabledOnlineProcessor) {
    onlinePaymentMethods.forEach(method => {
      if (paymentMethodSettings[method]?.enabled && !paymentMethodSettings[method]?.credentials) {
        errors.push(`${method} credentials are required when enabled`);
      }
    });
  }
};
