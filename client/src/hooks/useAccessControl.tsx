import { useAppSelector } from './useAppSelector';
import { TUserRole } from '@shared/types/user.types';
import { UserRole } from '@shared/constants/user';

export const useAccessControl = () => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);

  const validateAccess = (allowedRoles: TUserRole[], userRole: TUserRole) => {
    let accessGranted = false;

    switch (true) {
      case allowedRoles.length === 0:
        accessGranted = true;
        break;

      case userRole === UserRole.OWNER:
        accessGranted = true;
        break;

      case allowedRoles.includes(userRole):
        accessGranted = true;
        break;

      default:
        accessGranted = false;
    }

    return accessGranted;
  };

  return { isAuthenticated, loading, validateAccess };
};
