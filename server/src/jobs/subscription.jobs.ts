import cron from 'node-cron';
import config from '@/config/index.js';
import PaymentTransaction from '@/models/PaymentTransaction.model.js';
import User from '@/models/User.model.js';
import { SubscriptionStatus } from '@shared/constants/subscription.js';
import mongoose from 'mongoose';
import { logger } from '@/utils/index.js';
import Gym from '@/models/Gym.model.js';

//TODO: This is a temporary job to update the expired subscriptions to the gyms
//TODO: Move to dedicated file.
// const updateExpiredMembersSubscriptionsToGyms = async () => {
//   const session = await mongoose.startSession();

//   const results: { name: string; timezone: string; count: number }[] = [];

//   try {
//     session.startTransaction();

//     const gyms = (await Gym.find().select('_id name address.timezone').lean()) as IGym[];

//     for (const gym of gyms) {
//       const expiredSubscriptions = await PaymentTransaction.find({
//         gym: gym.id,
//         'subscription.endDate': { $lt: new Date() },
//         'subscription.status': SubscriptionStatus.ACTIVE,
//       }).session(session);

//       for (const subscription of expiredSubscriptions) {
//         await PaymentTransaction.findByIdAndUpdate(
//           subscription._id,
//           {
//             $set: { 'subscription.status': SubscriptionStatus.EXPIRED },
//           },
//           { session }
//         );

//         await User.findByIdAndUpdate(
//           subscription.paymentBy,
//           {
//             $set: {
//               'activeMembershipPlan.plan': null,
//               'activeMembershipPlan.payment': null,
//             },
//           },
//           { session }
//         );
//       }

//       results.push({
//         name: gym.name,
//         timezone: gym.address.timezone || 'UTC',
//         count: expiredSubscriptions.length,
//       });
//     }

//     await session.commitTransaction();

//     results.forEach(({ name, timezone, count }) => {
//       logger.info(
//         `Updated ${count} expired subscriptions for ${name.toUpperCase()} in timezone ${timezone}`
//       );
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     logger.error('Failed to update expired subscriptions', {
//       error: error instanceof Error ? error.message : String(error),
//       stack: error instanceof Error ? error.stack : undefined,
//       affectedGyms: results.map(r => ({ name: r.name, timezone: r.timezone })),
//     });
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

const updateGymExpiredSubscriptions = async (gymData: {
  id: string;
  name: string;
  address: { timezone: string };
}) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const expiredSubscriptions = await PaymentTransaction.find({
      gym: gymData.id,
      'subscription.endDate': { $lt: new Date() },
      'subscription.status': SubscriptionStatus.ACTIVE,
    }).session(session);

    for (const subscription of expiredSubscriptions) {
      await PaymentTransaction.findByIdAndUpdate(
        subscription._id,
        {
          $set: { 'subscription.status': SubscriptionStatus.EXPIRED },
        },
        { session }
      );

      await User.findByIdAndUpdate(
        subscription.paymentBy,
        {
          $set: {
            'activeMembershipPlan.plan': null,
            'activeMembershipPlan.payment': null,
          },
        },
        { session }
      );
    }

    await session.commitTransaction();
    logger.info(
      `Updated ${expiredSubscriptions.length} expired subscriptions for ${gymData.name.toUpperCase()} in timezone ${
        gymData.address?.timezone || 'UTC'
      }`
    );
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Failed to update expired subscriptions for gym ${gymData.name}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  } finally {
    session.endSession();
  }
};

const scheduleGymSubscriptionJob = (gym: {
  id: string;
  name: string;
  address: { timezone: string };
}) => {
  const timezone = gym.address.timezone || 'UTC';
  const gymData = {
    id: gym.id,
    name: gym.name,
    address: { timezone },
  };

  cron.schedule(
    '0 0 * * *',
    async () => {
      await updateGymExpiredSubscriptions(gymData);
    },
    {
      timezone,
      runOnInit: config.isDevelopment,
    }
  );

  logger.info(
    `Scheduled subscription cleanup job for gym ${gym.name.toUpperCase()} in timezone ${timezone}`
  );
};

export const initializeSubscriptionJobs = async () => {
  try {
    logger.info('Initializing scheduled subscription cleanup jobs');
    const gyms = await Gym.find().select('id name address.timezone');
    if (gyms.length === 0) {
      logger.warn('No gyms found to schedule subscription cleanup jobs');
      return;
    }

    gyms.forEach(gym =>
      scheduleGymSubscriptionJob({
        id: gym.id,
        name: gym.name,
        address: { timezone: gym.address.timezone || 'UTC' },
      })
    );

    logger.info(`Successfully scheduled subscription cleanup jobs for ${gyms.length} gyms`);
  } catch (error) {
    logger.error('Failed to initialize subscription cleanup jobs:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
};
