import { PaymentStatus } from '@shared/constants/payment.js';
import PaymentTransaction from '@/models/PaymentTransaction.model.js';
import { logger } from '@/utils/index.js';

export const cleanupExpiredPayments = async (): Promise<void> => {
  try {
    const result = await PaymentTransaction.updateMany(
      {
        status: PaymentStatus.PENDING,
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { status: PaymentStatus.EXPIRED },
        $unset: { expiresAt: '' },
      }
    );

    // result.matchedCount tells us how many documents matched our query
    // result.modifiedCount tells us how many documents were actually updated
    if (result.matchedCount === 0) {
      logger.info('No expired payments found to cleanup');
    } else {
      logger.info(`Cleaned up ${result.modifiedCount} expired payments`);
    }
  } catch (error) {
    logger.error('Failed to cleanup expired payments:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
};
