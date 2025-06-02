import { seedGym } from './gym.seed';
import { seedUser } from './user.seed';
import Gym from '../../../src/models/Gym.model';
import User from '../../../src/models/User.model';
import MembershipPlan from '../../../src/models/MembershipPlan.model';
import PaymentTransaction from '../../../src/models/PaymentTransaction.model';

export async function seedTestDatabase(timestamp: string) {
  const { gym } = await seedGym(timestamp);
  const { credentials: preRegisteredUser } = await seedUser(gym._id, timestamp);
  return {
    testGym: gym,
    preRegisteredUser,
  };
}

export async function cleanTestDatabase(timestamp: string) {
  try {
    await User.deleteMany({
      $or: [
        { email: { $regex: /test-.*@example\.com/ } },
        { email: { $regex: /.*@example\.com/ } },
        { createdAt: { $gte: new Date(Number(timestamp)) } },
      ],
    });

    await Gym.deleteMany({
      $or: [
        { name: { $regex: /Test Gym/ } },
        { email: { $regex: /@example\.com$/ } },
        { createdAt: { $gte: new Date(Number(timestamp)) } },
      ],
    });

    await MembershipPlan.deleteMany({
      $or: [{ name: 'Test Plan' }, { createdAt: { $gte: new Date(Number(timestamp)) } }],
    });

    await PaymentTransaction.deleteMany({
      createdAt: { $gte: new Date(Number(timestamp)) },
    });

    // Log cleanup results
    const remainingGyms = await Gym.find({}).lean();
    if (remainingGyms.length > 0) {
      console.log('Warning: Remaining gyms after cleanup:', remainingGyms);
    }
  } catch (error) {
    console.error('Error during database cleanup:', error);
    throw error;
  }
}
