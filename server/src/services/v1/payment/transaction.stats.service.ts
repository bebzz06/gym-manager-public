import PaymentTransaction from '@/models/PaymentTransaction.model.js';
import { Types } from 'mongoose';
import { PaymentStatus } from '@shared/constants/payment.js';
import { IPaymentHistoryOptions, IPaymentHistoryResponse } from '@/types/payment.history.types.js';
import { formatAmountToCurrency } from '@shared/utils/index.js';
//todo pagination
export const getGymTransactions = async (gymId: Types.ObjectId) => {
  return PaymentTransaction.find({ gym: gymId })
    .populate('membershipPlan')
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

//todo pagination

export const getGymTransactionStats = async (gymId: Types.ObjectId) => {
  return PaymentTransaction.aggregate([
    { $match: { gym: gymId } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' },
      },
    },
  ]);
};
//todo create controllers for fetching transactions and stats

export const getUserPaymentHistory = async (
  userId: Types.ObjectId,
  options: IPaymentHistoryOptions = {}
): Promise<IPaymentHistoryResponse> => {
  const { limit = 10, cursor, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const query: any = {
    paymentBy: userId,
    status: PaymentStatus.COMPLETED,
  };

  if (cursor) {
    const [value, id] = cursor.split('_');
    query.$or = [
      { [sortBy]: { [sortOrder === 'desc' ? '$lt' : '$gt']: value } },
      {
        [sortBy]: value,
        _id: { [sortOrder === 'desc' ? '$lt' : '$gt']: new Types.ObjectId(id) },
      },
    ];
  }

  try {
    const payments = await PaymentTransaction.find(query)
      .sort({
        [sortBy]: sortOrder === 'asc' ? 1 : -1,
        _id: sortOrder === 'asc' ? 1 : -1,
      })
      .select('amount currency type createdAt purchasedItem')
      .limit(limit + 1)
      .populate('purchasedItem', 'name description')
      .lean();

    const hasMore = payments.length > limit;
    const items = payments.slice(0, limit).map(payment => ({
      ...payment,
      amount: formatAmountToCurrency(payment.amount),
    }));

    const nextCursor = hasMore
      ? `${items[items.length - 1][sortBy as keyof (typeof items)[0]]}_${items[items.length - 1]._id}`
      : null;

    return {
      payments: items,
      hasPayments: items.length > 0,
      pagination: {
        cursor: nextCursor,
        limit,
        hasMore,
      },
    };
  } catch (error) {
    return {
      payments: [],
      hasPayments: false,
      pagination: {
        cursor: null,
        limit,
        hasMore: false,
      },
    };
  }
};
