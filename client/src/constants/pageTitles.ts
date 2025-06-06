const APP_NAME = import.meta.env.VITE_APP_NAME;
//get here the dojo name like "Dojo Manager - Dojo Name"
// FOR COMPONENTS
export const TITLES = {
  SIGNIN: 'Sign In',
  SIGNUP: 'Sign Up',
  UNAUTHORIZED: 'Unauthorized',
  REGISTRATION_SUCCESS: 'Registration Success',
  REGISTRATION_CONFIRMATION: 'Registration Confirmation',
  TERMS_CONDITIONS: 'Terms & Conditions',
  DASHBOARD: 'Dashboard',
  ECOMMERCE: 'eCommerce',
  ANALYTICS: 'Analytics',
  MARKETING: 'Marketing',
  CRM: 'CRM',
  STOCKS: 'Stocks',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  ATTENDANCE: 'Attendance',
  MEMBERS: 'Members',
  EDIT_MEMBER: 'Edit Member',
  REGISTRATION_LINKS: 'Registration Links',
  MEMBER_REGISTRATION: 'Member Registration',
  INVALID_LINK: 'Invalid Registration Link',
  ACCOUNT_CONFIRMATION: 'Account Confirmation',
  REQUEST_PASSWORD_RESET: 'Request Password Reset',
  RESET_PASSWORD: 'Reset Password',
  COMING_SOON: 'Coming Soon',
  REQUEST_EMAIL_VERIFICATION: 'Request Email Verification',
  MEMBERSHIP_PLANS: 'Membership Plans',
  PAYMENT_CALLBACK: 'Payment Callback',
  PAYMENTS: 'Payments',
} as const;
// FOR ROUTES
export const PAGE_TITLES = {
  SIGNIN: `${TITLES.SIGNIN} | ${APP_NAME}`,
  SIGNUP: `${TITLES.SIGNUP} | ${APP_NAME}`,
  UNAUTHORIZED: `${TITLES.UNAUTHORIZED} | ${APP_NAME}`,
  REGISTRATION_SUCCESS: `${TITLES.REGISTRATION_SUCCESS} | ${APP_NAME}`,
  REGISTRATION_CONFIRMATION: `${TITLES.REGISTRATION_CONFIRMATION} | ${APP_NAME}`,
  TERMS_CONDITIONS: `${TITLES.TERMS_CONDITIONS} | ${APP_NAME}`,
  ECOMMERCE: `${TITLES.ECOMMERCE} | ${APP_NAME}`,
  ANALYTICS: `${TITLES.ANALYTICS} | ${APP_NAME}`,
  MARKETING: `${TITLES.MARKETING} | ${APP_NAME}`,
  CRM: `${TITLES.CRM} | ${APP_NAME}`,
  STOCKS: `${TITLES.STOCKS} | ${APP_NAME}`,
  PROFILE: `${TITLES.PROFILE} | ${APP_NAME}`,
  SETTINGS: `${TITLES.SETTINGS} | ${APP_NAME}`,
  ATTENDANCE: `${TITLES.ATTENDANCE} | ${APP_NAME}`,
  MEMBERS: `${TITLES.MEMBERS} | ${APP_NAME}`,
  EDIT_MEMBER: `${TITLES.EDIT_MEMBER} | ${APP_NAME}`,
  REGISTRATION_LINKS: `${TITLES.REGISTRATION_LINKS} | ${APP_NAME}`,
  MEMBER_REGISTRATION: `${TITLES.MEMBER_REGISTRATION} | ${APP_NAME}`,
  INVALID_LINK: `${TITLES.INVALID_LINK} | ${APP_NAME}`,
  ACCOUNT_CONFIRMATION: `${TITLES.ACCOUNT_CONFIRMATION} | ${APP_NAME}`,
  REQUEST_PASSWORD_RESET: `${TITLES.REQUEST_PASSWORD_RESET} | ${APP_NAME}`,
  RESET_PASSWORD: `${TITLES.RESET_PASSWORD} | ${APP_NAME}`,
  COMING_SOON: `${TITLES.COMING_SOON} | ${APP_NAME}`,
  REQUEST_EMAIL_VERIFICATION: `${TITLES.REQUEST_EMAIL_VERIFICATION} | ${APP_NAME}`,
  MEMBERSHIP_PLANS: `${TITLES.MEMBERSHIP_PLANS} | ${APP_NAME}`,
  PAYMENT_CALLBACK: `${TITLES.PAYMENT_CALLBACK} | ${APP_NAME}`,
  PAYMENTS: `${TITLES.PAYMENTS} | ${APP_NAME}`,
} as const;
