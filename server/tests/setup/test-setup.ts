import { test as base } from '@playwright/test';
import { seedTestDatabase, cleanTestDatabase } from './seeds';
import mongoose from 'mongoose';
import { TUserRole } from '../../../shared/types/user.types';
import User from '../../src/models/User.model';

type TTestContext = {
  testContext: {
    preRegisteredUser: {
      email: string;
      password: string;
    };
    updateUserRole: (role: TUserRole) => Promise<void>;
  };
};

export const test = base.extend<TTestContext>({
  testContext: async ({ request }, use) => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string, {
        dbName: process.env.DB_NAME,
      });
    }

    const timestamp = Date.now().toString();
    const { preRegisteredUser } = await seedTestDatabase(timestamp);

    const updateUserRole = async (role: TUserRole) => {
      await User.findOneAndUpdate({ email: preRegisteredUser.email }, { role });
    };

    await use({
      preRegisteredUser,
      updateUserRole,
    });

    await cleanTestDatabase(timestamp);
  },
});

export { expect } from '@playwright/test';
