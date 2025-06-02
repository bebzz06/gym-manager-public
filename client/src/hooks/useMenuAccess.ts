import { useAppSelector } from './useAppSelector';
import { SIDEBAR_MENU_ACCESS, USER_DROPDOWN_ACCESS } from '@/constants/permissions';
import { useAccessControl } from '@/hooks/useAccessControl';

export const useMenuAccess = () => {
  const { role } = useAppSelector(state => state.profile);
  const { validateAccess } = useAccessControl();

  const canAccessMenuItem = (
    menuItem: keyof typeof SIDEBAR_MENU_ACCESS | keyof typeof USER_DROPDOWN_ACCESS
  ): boolean => {
    if (!role) return false;

    const allowedRoles =
      SIDEBAR_MENU_ACCESS[menuItem as keyof typeof SIDEBAR_MENU_ACCESS] ||
      USER_DROPDOWN_ACCESS[menuItem as keyof typeof USER_DROPDOWN_ACCESS];

    return validateAccess(allowedRoles, role);
  };

  return { canAccessMenuItem };
};
