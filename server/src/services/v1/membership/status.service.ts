import { MembershipStatusTransitions } from '@shared/constants/user.js';
import { TMembershipStatus } from '@shared/types/user.types.js';

//todo implement this transition after full recurrent payment integration
export const validateStatusTransition = (
  currentStatus: TMembershipStatus,
  newStatus: TMembershipStatus
): boolean => {
  if (currentStatus === newStatus) return true;

  const allowedTransitions = MembershipStatusTransitions[
    currentStatus
  ] as readonly TMembershipStatus[];
  return allowedTransitions.includes(newStatus);
};
