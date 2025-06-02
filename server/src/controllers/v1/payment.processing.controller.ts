import { NextFunction, Request, Response } from 'express';
import { createPagueloFacilPayment } from '@/services/v1/payment/paguelo.facil.service.js';
import { IUser } from '@/types/user.types.js';
import PaymentTransaction from '@/models/PaymentTransaction.model.js';
import { PaymentStatus, PaymentTransactionTypes } from '@shared/constants/payment.js';
import mongoose from 'mongoose';
import User from '@/models/User.model.js';
import { IMembershipPlan } from '@/types/membership.plan.types.js';
import { SubscriptionStatus } from '@shared/constants/subscription.js';
import { createCashPayment } from '@/services/v1/payment/cash.service.js';
import { logger } from '@/utils/common/logger.utils.js';
import { IPaymentTransaction } from '@/types/payment.transaction.types.js';

export const createPagueloFacilPaymentLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { purchasedItemId, purchasedItemType, paymentBy } = req.body;
    const user = req.user as IUser; //extract user id when is self payment

    if (!purchasedItemId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create payment without purchased item id',
      });
    }

    // Get the member's current status and update if needed
    const memberToUpdate = await User.findById(paymentBy || user.id);
    if (!memberToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    const paymentData = await createPagueloFacilPayment({
      purchasedItemId,
      purchasedItemType,
      paymentBy: paymentBy || user.id,
    });

    return res.status(200).json({
      success: true,
      data: paymentData,
    });
  } catch (error: any) {
    logger.error('Paguelo Facil button generation error:', error);
    next(error);
  }
};

export const verifyPagueloFacilPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentId, TotalPagado, Estado, Tipo, Oper, Razon } = req.body.queryParams;

    const payment = await PaymentTransaction.findById(paymentId)
      .populate<{ purchasedItem: IMembershipPlan }>('purchasedItem', 'category _id')
      .populate('paymentBy')
      .session(session);

    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      await session.abortTransaction();
      return res.json({
        success: false,
        data: {
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
        },
        message: 'Payment was already processed',
      });
    }

    const paymentStatus = Estado === 'Aprobada' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

    // Base update for payment
    const updatePayment: Partial<IPaymentTransaction> = {
      status: paymentStatus,
      metadata: {
        cardType: Tipo,
        operationId: Oper,
        gatewayStatus: Estado,
        amountPaid: TotalPagado,
        failureReason: Razon,
      },
    };

    // Only update subscription if it's a membership plan
    if (payment.type === PaymentTransactionTypes.MEMBERSHIP_PLAN) {
      updatePayment.subscription = {
        ...payment.subscription,
        status:
          paymentStatus === PaymentStatus.COMPLETED
            ? SubscriptionStatus.ACTIVE
            : SubscriptionStatus.PENDING,
      };

      // Update user's membership only for membership plans
      if (paymentStatus === PaymentStatus.COMPLETED) {
        await User.findByIdAndUpdate(
          payment.paymentBy._id,
          {
            $set: {
              activeMembershipPlan: {
                plan: payment.purchasedItem._id,
                payment: payment._id,
              },
            },
          },
          { session }
        );
      } else {
        await User.findByIdAndUpdate(
          payment.paymentBy._id,
          {
            $set: {
              activeMembershipPlan: {
                plan: null,
                payment: null,
              },
            },
          },
          { session }
        );
      }
    }

    const updatedPayment = await PaymentTransaction.findByIdAndUpdate(
      paymentId,
      {
        $set: updatePayment,
        $unset: { expiresAt: '' },
      },
      { new: true, session }
    );

    // Commit the transaction
    await session.commitTransaction();

    if (paymentStatus === PaymentStatus.FAILED) {
      logger.error(`Payment failed for payment ID: ${paymentId}`, {
        estado: Estado,
        operationId: Oper,
        failureReason: Razon,
      });

      return res.status(400).json({
        success: false,
        data: {
          status: updatedPayment?.status,
          amount: updatedPayment?.amount,
          currency: updatedPayment?.currency,
          failureReason: Razon,
        },
        message: 'Payment processing failed',
      });
    }

    return res.json({
      success: true,
      data: {
        status: updatedPayment?.status,
        amount: updatedPayment?.amount,
        currency: updatedPayment?.currency,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Payment verification error:', error);
    next(error);
  } finally {
    session.endSession();
  }
};

export const createCashPaymentTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { purchasedItemId, purchasedItemType, paymentBy, notes } = req.body;
    const user = req.user as IUser;

    const payment = await createCashPayment({
      purchasedItemId,
      purchasedItemType,
      paymentBy,
      receivedBy: user.id,
      notes,
      gym: user.gym,
    });

    return res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    logger.error('Cash payment creation error:', error);

    if (error.message) {
      switch (error.message) {
        case 'Invalid item type':
        case 'Invalid payment type':
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        case 'Purchased item not found':
        case 'User not found':
        case 'Gym not found':
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        case 'You already have an active membership plan. You can only have one active membership at a time.':
          return res.status(409).json({
            success: false,
            message: error.message,
          });
        default:
          return next(error);
      }
    }
  }
};

export const confirmCashPayment = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentId } = req.body;
    const user = req.user as IUser;

    const payment = await PaymentTransaction.findById(paymentId)
      .populate<{ purchasedItem: IMembershipPlan }>('purchasedItem', 'category')
      .session(session);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Payment is already completed',
      });
    }

    // Base update for payment
    const updatePayment: Partial<IPaymentTransaction> = {
      status: PaymentStatus.COMPLETED,
      receivedBy: user.id,
    };

    // Only update subscription if it's a membership plan
    if (payment.type === PaymentTransactionTypes.MEMBERSHIP_PLAN) {
      updatePayment.subscription = {
        isSubscription: true,
        status: SubscriptionStatus.ACTIVE,
        startDate: payment.subscription?.startDate,
        endDate: payment.subscription?.endDate,
        renewalDate: payment.subscription?.renewalDate,
        //todo cancelled at once subscription api from paguelo facil is provided.
      };

      // Update user's membership
      await User.findByIdAndUpdate(
        payment.paymentBy,
        {
          $set: {
            activeMembershipPlan: {
              plan: payment.purchasedItem._id,
              payment: payment._id,
            },
          },
        },
        { session }
      );
    }

    // Update payment status
    await PaymentTransaction.findByIdAndUpdate(
      paymentId,
      {
        $set: updatePayment,
        $unset: { expiresAt: '' },
      },
      { session }
    );

    await session.commitTransaction();
    return res.status(200).json({
      success: true,
      message: 'Cash payment confirmed successfully',
    });
  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Error confirming cash payment:', error);
    next(error);
  } finally {
    session.endSession();
  }
};
