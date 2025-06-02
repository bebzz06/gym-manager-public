import { Request, Response } from 'express';
import { IUser } from '@/types/user.types.js';
import PaymentTransaction from '@/models/PaymentTransaction.model.js';
import {
  PaymentStatus,
  PaymentMethods,
  PaymentTransactionTypes,
} from '@shared/constants/payment.js';
import {
  TPaymentMethod,
  TPaymentStatus,
  TPaymentTransactionType,
} from '@shared/types/payment.types';
import { Types } from 'mongoose';
import { IPopulatedTransaction, ISanitizedTransaction } from '@/types/payment.transaction.types.js';
import { formatAmountToCurrency } from '@shared/utils/index.js';
import { SortFields, SortOrder } from '@shared/constants/sort.js';
import { TValidSortField, TSortOrder } from '@shared/types/sort.types';
import Gym from '@/models/Gym.model.js';
import { formatDatesInObject } from '@/utils/index.js';

export const getPaymentTransactions = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    // Validate and sanitize input parameters
    const sortBy = (req.query.sortBy as TValidSortField) || SortFields.CREATED_AT;
    const sortOrder = (req.query.sortOrder as TSortOrder) || SortOrder.DESC;

    const limitNumber = Math.min(Number(req.query.limit) || 10, 100); // Cap at 100

    const { startDate, endDate, minAmount, maxAmount, paymentMethod, status, type, cursor } =
      req.query;

    // Build query with all filters
    const query: any = { gym: user.gym };

    // Add cursor condition based on sort field
    if (cursor) {
      const [value, id] = (cursor as string).split('_');
      query.$or = [
        { [sortBy]: { [sortOrder === 'desc' ? '$lt' : '$gt']: value } },
        {
          [sortBy]: value,
          _id: { [sortOrder === 'desc' ? '$lt' : '$gt']: new Types.ObjectId(id) },
        },
      ];
    }

    // Add all existing filters
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    // Payment method filter
    if (paymentMethod && Object.values(PaymentMethods).includes(paymentMethod as TPaymentMethod)) {
      query.paymentMethod = paymentMethod;
    }

    // Status filter
    if (status && Object.values(PaymentStatus).includes(status as TPaymentStatus)) {
      query.status = status;
    }

    // Type filter
    if (type && Object.values(PaymentTransactionTypes).includes(type as TPaymentTransactionType)) {
      query.type = type;
    }

    // Execute query with consistent sorting
    const transactions = await PaymentTransaction.find(query)
      .sort({
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
        _id: sortOrder === 'asc' ? 1 : -1,
      })
      .limit(limitNumber + 1)
      .populate<IPopulatedTransaction>('paymentBy', 'firstName lastName email')
      .populate<IPopulatedTransaction>('receivedBy', 'firstName lastName')
      .lean();

    const hasMore = transactions.length > limitNumber;
    const items = transactions.slice(0, limitNumber);

    // Create composite cursor from sort field and _id
    const nextCursor = hasMore
      ? `${items[items.length - 1][sortBy]}_${items[items.length - 1]._id}`
      : null;

    // Get gym timezone - you'll need to populate it or fetch it
    const gym = await Gym.findById(user.gym).select('address.timezone');
    const timezone = gym?.address?.timezone || 'UTC';

    // Transform data for response
    const sanitizedTransactions: ISanitizedTransaction[] = items.map(
      (transaction: IPopulatedTransaction) => {
        // Format all dates in the transaction
        const formattedDates = formatDatesInObject(transaction, timezone, [
          'createdAt',
          'invoicing.invoiceDate',
          'subscription.startDate',
          'subscription.endDate',
          'subscription.renewalDate',
          'subscription.cancelledAt',
        ]);

        return {
          id: transaction._id.toString(),
          amount: formatAmountToCurrency(transaction.amount),
          currency: transaction.currency,
          status: transaction.status,
          paymentMethod: transaction.paymentMethod,
          type: transaction.type,
          paymentBy: {
            id: transaction.paymentBy._id.toString(),
            firstName: transaction.paymentBy.firstName,
            lastName: transaction.paymentBy.lastName,
            email: transaction.paymentBy.email,
          },
          receivedBy: transaction.receivedBy
            ? {
                id: transaction.receivedBy._id.toString(),
                firstName: transaction.receivedBy.firstName,
                lastName: transaction.receivedBy.lastName,
              }
            : null,
          invoicing: formattedDates.invoicing,
          subscription: formattedDates.subscription,
          createdAt: formattedDates.createdAt,
          notes: transaction.notes,
          metadata: transaction.metadata,
        };
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment transactions retrieved successfully',
      data: {
        transactions: sanitizedTransactions,
        pagination: {
          cursor: nextCursor,
          limit: limitNumber,
          hasMore,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment transactions',
    });
  }
};
