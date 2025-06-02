import { USER_DROPDOWN_ACCESS, ROUTES } from '@/constants';
import { ProfileIcon, SettingsIcon, LogoutIcon } from '@/components/Icons';

export const dropdownMenuItems = [
  {
    title: 'My Profile',
    path: ROUTES.DASHBOARD.PROFILE,
    access: 'PROFILE' as keyof typeof USER_DROPDOWN_ACCESS,
    icon: <ProfileIcon width={'22'} height={'22'} viewBox={'0 0 22 22'} />,
  },
  {
    title: 'Account Settings',
    path: ROUTES.DASHBOARD.SETTINGS,
    access: 'SETTINGS' as keyof typeof USER_DROPDOWN_ACCESS,
    icon: <SettingsIcon width={'22'} height={'22'} viewBox={'0 0 22 22'} />,
  },
  {
    title: 'Logout',
    path: ROUTES.HOME,
    access: 'LOGOUT' as keyof typeof USER_DROPDOWN_ACCESS,
    icon: <LogoutIcon width={'22'} height={'22'} viewBox={'0 0 22 22'} />,
  },
];
