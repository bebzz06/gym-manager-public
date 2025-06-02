import Gym from '../../../src/models/Gym.model';
import { SubscriptionStatus } from '../../../../shared/constants/subscription';

export function createTestGymData(timestamp: string) {
  return {
    name: `Test Gym ${timestamp}`,
    email: `test-gym-${timestamp}@example.com`,
    phoneNumber: '+1234567890',
    address: {
      addressLine1: '123 Test St',
      city: 'Test City',
      region: 'TS',
      postalCode: '12345',
      country: 'PA',
      timezone: 'UTC',
    },
    subscriptionStatus: SubscriptionStatus.TRIAL,
  };
}

export async function seedGym(timestamp: string) {
  try {
    const gymData = createTestGymData(timestamp);
    const [gym] = await Gym.create([gymData]);
    return { gym };
  } catch (error) {
    console.error('Error seeding gym:', error);
    throw error;
  }
}
