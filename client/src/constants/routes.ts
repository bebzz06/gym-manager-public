export const ROUTES = {
  HOME: '/',
  DASHBOARD: {
    ROOT: '/dashboard',
    PROFILE: '/dashboard/profile',
    SETTINGS: '/dashboard/settings',
    CALENDAR: '/dashboard/calendar',
    MEMBERS: '/dashboard/members',
    EDIT_MEMBER: '/dashboard/members/:id/edit',
    REGISTRATION_LINKS: '/dashboard/registration-links',
    MEMBERSHIP_PLANS: '/dashboard/membership-plans',
    PAYMENTS: '/dashboard/payments',
  },
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  UNAUTHORIZED: '/unauthorized',
  REGISTRATION_CONFIRMATION: '/registration-confirmation',
  ACCOUNT_CONFIRMATION: '/confirm-account',
  REGISTRATION_SUCCESS: '/registration-success',
  TERMS_CONDITIONS: '/terms-conditions',
  MEMBER_REGISTRATION: '/register/:token',
  INVALID_LINK: '/invalid-link',
  REQUEST_PASSWORD_RESET: '/request-password-reset',
  RESET_PASSWORD: '/reset-password',
  COMING_SOON: '/coming-soon',
  REQUEST_EMAIL_VERIFICATION: '/request-email-verification',
  PAYMENT_CALLBACK: '/payment/callback',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VALIDATE_SESSION: '/auth/valid-session',
    CHANGE_PASSWORD: '/auth/change-password',
    ACCOUNT_CONFIRMATION: '/auth/account-confirmation/', //:token,
    RESEND_VERIFICATION_EMAIL: '/auth/resend-verification-email',
    REQUEST_PASSWORD_RESET: '/auth/send-password-reset-email',
    VERIFY_PASSWORD_RESET_TOKEN: '/auth/password-reset-token-verification/', //:token,
    RESET_PASSWORD: '/auth/password-reset',
    SEND_MEMBER_SETUP_EMAIL: '/auth/send-setup-email',
    MEMBER_SETUP_CONFIRMATION: '/auth/account-confirmation-with-password',
  },
  GYM: {
    REGISTER: '/gyms/register',
    LOGO: '/gyms/logo',
    UPDATE: '/gyms',
  },
  MEMBER: {
    CREATE: '/members',
    GET_ALL: '/members',
    GET_BY_ID: '/members/', //members/:id
    UPDATE: '/members/', //members/:id
    DELETE: '/members/', //members/:id
    SEARCH: '/members/search',
    SEARCH_GUARDIAN_BY_EMAIL: '/members/guardians',
  },
  PROFILE: {
    PROFILE: '/profile',
    PROFILE_PICTURE: '/profile/profile-picture',
  },
  REGISTRATION: {
    GENERATE_LINK: '/registration-links/new',
    GET_LINKS: '/registration-links',
    REVOKE_LINK: '/registration-links/revoked/', //registration-links/revoke/:id
    EXPIRE_LINK: '/registration-links/expired/', //registration-links/expire/:id
    VALIDATE_LINK: '/registration-links/valid/', //registration-links/valid/:token
  },
  MEMBERSHIP_PLANS: {
    CREATE: '/membership-plans',
    GET_ALL: '/membership-plans',
    TOGGLE_STATUS: (id: string) => `/membership-plans/${id}/toggle`,
  },
  PAYMENT: {
    PAGUELO_FACIL_BUTTON: '/payment/paguelo-facil/button',
    PAGUELO_FACIL_VERIFY: '/payment/paguelo-facil/verify',
    CASH_PAYMENT: '/payment/cash',
    CASH_PAYMENT_CONFIRM: '/payment/cash/confirm',
  },
  PAYMENT_TRANSACTION: {
    GET_ALL: '/payment-transactions',
  },
};
