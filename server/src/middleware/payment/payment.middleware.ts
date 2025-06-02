import { Request, Response, NextFunction } from 'express';
import { IUser } from '@/types/user.types.js';
import { MODEL_FOR_PAYMENT_TYPE } from '@/constants/payment.js';
import { PaymentStatus } from '@shared/constants/payment.js';
import { TPaymentStatus } from '@shared/types/payment.types.js';
import PaymentTransaction from '@/models/PaymentTransaction.model.js';
import User from '@/models/User.model.js';
import { SubscriptionStatus } from '@shared/constants/subscription.js';

//TODO: refactor this
export const validatePaymentTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { purchasedItemId, purchasedItemType } = req.body;
    const user = req.user as IUser;

    const Model = MODEL_FOR_PAYMENT_TYPE[purchasedItemType as keyof typeof MODEL_FOR_PAYMENT_TYPE];
    if (!Model) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type',
      });
    }

    // Verify item exists and belongs to user's gym
    const item = await Model.findOne({
      _id: purchasedItemId,
      gym: user.gym,
      isActive: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Invalid or inactive ${purchasedItemType.toLowerCase()}`,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error validating payment transaction',
    });
  }
};
//TODO: IMPLEMENT THIS
export const checkSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as IUser).id;
    if (!userId) return next();

    const activeSubscription = await PaymentTransaction.findOne({
      paymentBy: userId,
      'subscription.status': SubscriptionStatus.ACTIVE,
    });

    if (
      activeSubscription?.subscription?.endDate &&
      activeSubscription.subscription.endDate < new Date()
    ) {
      // Update subscription status
      await Promise.all([
        PaymentTransaction.findByIdAndUpdate(activeSubscription._id, {
          $set: {
            'subscription.status': SubscriptionStatus.EXPIRED,
          },
        }),
        User.findByIdAndUpdate(userId, {
          $set: {
            'activeMembershipPlan.plan': null,
            'activeMembershipPlan.payment': null,
          },
        }),
      ]);
    }

    next();
  } catch (error) {
    next(error);
  }
};
export const checkPaymentStatus = async (paymentId: string): Promise<TPaymentStatus> => {
  const payment = await PaymentTransaction.findById(paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (
    payment.status === PaymentStatus.PENDING &&
    payment.expiresAt &&
    payment.expiresAt < new Date()
  ) {
    payment.status = PaymentStatus.EXPIRED;
    payment.expiresAt = undefined;
    await payment.save();
  }

  return payment.status;
};
