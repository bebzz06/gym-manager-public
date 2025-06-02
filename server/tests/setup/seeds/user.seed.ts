import User from '../../../src/models/User.model';
import { UserRole } from '../../../../shared/constants/user';

export function createTestUserData(timestamp: string) {
  return {
    firstName: 'Pre',
    lastName: 'Existing',
    email: `test-${timestamp}@example.com`,
    password: 'TestPassword123!',
    phoneNumber: '+1234567890',
    dateOfBirth: '1990-01-01',
    role: UserRole.MEMBER,
    isEmailVerified: true,
  };
}

export async function seedUser(gymId: string, timestamp: string) {
  try {
    const userData = createTestUserData(timestamp);

    const user = await User.create({
      ...userData,
      gym: gymId,
    });

    return {
      user,
      credentials: {
        email: userData.email,
        password: userData.password,
      },
    };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}
