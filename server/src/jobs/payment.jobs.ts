import cron from 'node-cron';
import { cleanupExpiredPayments } from '@/services/v1/payment/payment.service.js';
import { logger } from '@/utils/index.js';

export const initializePaymentJobs = async () => {
  try {
    // Run cleanup immediately on server start
    logger.info('Starting initial payment cleanup job');
    await cleanupExpiredPayments();
    logger.info('Initial payment cleanup job completed successfully');
  } catch (error) {
    logger.error('Initial payment cleanup job failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  // Then schedule it to run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Starting scheduled payment cleanup job');
      await cleanupExpiredPayments();
      logger.info('Scheduled payment cleanup job completed successfully');
    } catch (error) {
      logger.error('Payment cleanup job failed:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Optionally: Add monitoring/alerting here
      // notifyAdmins(error);
      // metrics.incrementJobFailureCount('payment-cleanup');
    } finally {
      // Any cleanup that needs to happen regardless of success/failure
    }
  });
};
