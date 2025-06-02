import { IUser } from '@/types/user.types.js';
import { syncGuardianToEmergencyContact } from '@/services/v1/user/guardian.service.js';

export const prepareUserCreation = (user: IUser): void => {
  syncGuardianToEmergencyContact(user);
};
