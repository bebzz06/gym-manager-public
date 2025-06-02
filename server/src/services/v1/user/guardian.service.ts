import { IUser } from '@/types/user.types.js';
import mongoose from 'mongoose';

export const syncGuardianToEmergencyContact = (user: IUser): void => {
  if (user.age && user.age < 18 && user.guardian) {
    user.emergencyContact = {
      firstName: user.guardian.firstName,
      lastName: user.guardian.lastName,
      email: user.guardian.email,
      phoneNumber: user.guardian.phoneNumber,
      relationship: user.guardian.relationship,
    };
  }
};

export const findPotentialGuardian = async (email: string) => {
  return mongoose
    .model('User')
    .findOne({
      email: email.toLowerCase(),
      // Must be 18 or older
      $expr: {
        $gte: [
          { $subtract: [new Date(), '$dateOfBirth'] },
          18 * 365 * 24 * 60 * 60 * 1000, // 18 years in milliseconds
        ],
      },
    })
    .select('_id firstName lastName email phoneNumber')
    .exec();
};
