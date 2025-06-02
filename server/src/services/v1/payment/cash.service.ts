import PaymentTransaction from '@/models/PaymentTransaction.model.js';
import { PaymentMethods, PaymentStatus } from '@shared/constants/payment.js';
import { TPaymentTransactionType } from '@shared/types/payment.types';
import { MODEL_FOR_PAYMENT_TYPE, PAYMENT_TYPE_FOR } from '@/constants/payment.js';
import { calculateInvoicing, calculateSubscription } from '@/utils/index.js';
import { SubscriptionStatus } from '@shared/constants/subscription.js';
import { Types } from 'mongoose';
import { PaymentTransactionTypes } from '@shared/constants/payment.js';
import User from '@/models/User.model.js';
import Gym from '@/models/Gym.model.js';

export const createCashPayment = async ({
  purchasedItemId,
  purchasedItemType,
  paymentBy,
  receivedBy,
  notes,
  gym,
}: {
  purchasedItemId: string;
  purchasedItemType: TPaymentTransactionType;
  paymentBy: string;
  receivedBy: string;
  notes: string;
  gym: Types.ObjectId;
}) => {
  const Model = MODEL_FOR_PAYMENT_TYPE[purchasedItemType as keyof typeof MODEL_FOR_PAYMENT_TYPE];

  if (!Model) {
    throw new Error('Invalid item type');
  }

  const purchasedItem = await Model.findById(purchasedItemId);
  if (!purchasedItem) {
    throw new Error('Purchased item not found');
  }

  if (purchasedItemType === PaymentTransactionTypes.MEMBERSHIP_PLAN) {
    const user = await User.findById(paymentBy);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.activeMembershipPlan?.plan) {
      throw new Error(
        'You already have an active membership plan. You can only have one active membership at a time.'
      );
    }
  }

  const paymentTransactionType =
    PAYMENT_TYPE_FOR[purchasedItemType as keyof typeof PAYMENT_TYPE_FOR];
  if (!paymentTransactionType) {
    throw new Error('Invalid payment type');
  }

  const gymDoc = await Gym.findById(gym);
  if (!gymDoc) {
    throw new Error('Gym not found');
  }

  const { quantity, unitPrice, subtotal, taxAmount, totalAmount } =
    calculateInvoicing(purchasedItem);
  const { startDate, endDate } = calculateSubscription(purchasedItem, gymDoc.address.timezone);

  const payment = await PaymentTransaction.create({
    gym,
    type: paymentTransactionType,
    purchasedItem: purchasedItemId,
    paymentBy,
    paymentMethod: PaymentMethods.CASH,
    receivedBy,
    status: PaymentStatus.PENDING,
    amount: totalAmount,
    currency: purchasedItem.pricing.currency,
    notes,
    invoicing: {
      taxAmount,
      taxRate: purchasedItem.pricing.tax.rate,
      items: [
        {
          description: purchasedItem.name,
          quantity,
          unitPrice,
          amount: subtotal,
          taxable: purchasedItem.pricing.tax.enabled,
        },
      ],
    },
    ...(purchasedItemType === PaymentTransactionTypes.MEMBERSHIP_PLAN && {
      subscription: {
        isSubscription: true,
        startDate,
        endDate,
        status: SubscriptionStatus.PENDING,
        renewalDate: endDate,
      },
    }),
  });

  return payment;
};
