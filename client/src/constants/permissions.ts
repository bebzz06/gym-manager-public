import { UserRole, UserRoleAccess } from '@shared/constants/user';
import { ROUTES } from './routes';

export const ROUTE_ACCESS = {
  [ROUTES.DASHBOARD.MEMBERS]: UserRoleAccess[UserRole.ADMIN],
  [ROUTES.DASHBOARD.SETTINGS]: UserRoleAccess[UserRole.ADMIN],
  [ROUTES.DASHBOARD.REGISTRATION_LINKS]: UserRoleAccess[UserRole.ADMIN],
  [ROUTES.DASHBOARD.PROFILE]: UserRoleAccess[UserRole.MEMBER],
  [ROUTES.DASHBOARD.EDIT_MEMBER]: UserRoleAccess[UserRole.ADMIN],
  [ROUTES.DASHBOARD.MEMBERSHIP_PLANS]: UserRoleAccess[UserRole.MEMBER],
  [ROUTES.COMING_SOON]: UserRoleAccess[UserRole.MEMBER],
  [ROUTES.DASHBOARD.PAYMENTS]: UserRoleAccess[UserRole.ADMIN],
} as const;

export const SIDEBAR_MENU_ACCESS = {
  MEMBERS: UserRoleAccess[UserRole.ADMIN],
  SETTINGS: UserRoleAccess[UserRole.ADMIN],
  REGISTRATION_LINKS: UserRoleAccess[UserRole.ADMIN],
  PROFILE: UserRoleAccess[UserRole.MEMBER],
  MEMBERSHIP_PLANS: UserRoleAccess[UserRole.MEMBER],
  PAYMENTS: UserRoleAccess[UserRole.ADMIN],
} as const;
export const USER_DROPDOWN_ACCESS = {
  PROFILE: UserRoleAccess[UserRole.MEMBER],
  SETTINGS: UserRoleAccess[UserRole.ADMIN],
  LOGOUT: UserRoleAccess[UserRole.MEMBER],
} as const;
