import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import PageLayout from '@/layouts/PageLayout';
import PageTitle from '@/components/PageTitle';
import OpenRoute from '@/router/guards/OpenRoute';
import { ROUTES, PAGE_TITLES } from '@/constants';

// Lazy load components
const HomePage = lazy(() => import('@/pages/HomePage'));
const SignIn = lazy(() => import('@/pages/Authentication/SignIn'));
const SignUp = lazy(() => import('@/pages/Authentication/SignUp'));
const RegistrationSuccess = lazy(() => import('@/pages/Pages/RegistrationSuccess'));
const TermsConditions = lazy(() => import('@/pages/Pages/TermsConditions'));
const MemberRegistration = lazy(() => import('@/pages/Authentication/MemberRegistration'));
const RegistrationConfirmation = lazy(
  () => import('@/pages/Authentication/AccountConfirmation/RegistrationConfirmation')
);
const InvalidLink = lazy(() => import('@/pages/Pages/InvalidLink'));
const AccountConfirmation = lazy(
  () => import('@/pages/Authentication/AccountConfirmation/AccountConfirmation')
);
const RequestPasswordReset = lazy(
  () => import('@/pages/Authentication/AccountConfirmation/RequestPasswordReset')
);
const ResetPasswordConfirm = lazy(
  () => import('@/pages/Authentication/AccountConfirmation/ResetPasswordConfirm')
);
const RequestEmailVerification = lazy(
  () => import('@/pages/Authentication/AccountConfirmation/RequestEmailVerification')
);
const PaymentCallback = lazy(() => import('@/pages/Payments/PaymentCallback'));
export const normalizeRoutePath = (path: string) => path.slice(1);

export const openRoutes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <PageLayout />,
    children: [
      {
        path: '',
        element: (
          <OpenRoute>
            <HomePage />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.SIGNIN),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.SIGNIN} />
            <SignIn />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.SIGNUP),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.SIGNUP} />
            <SignUp />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.REGISTRATION_SUCCESS),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.REGISTRATION_SUCCESS} />
            <RegistrationSuccess />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.MEMBER_REGISTRATION),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.MEMBER_REGISTRATION} />
            <MemberRegistration />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.INVALID_LINK),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.INVALID_LINK} />
            <InvalidLink />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.TERMS_CONDITIONS),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.TERMS_CONDITIONS} />
            <TermsConditions />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.REGISTRATION_CONFIRMATION),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.REGISTRATION_CONFIRMATION} />
            <RegistrationConfirmation />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.ACCOUNT_CONFIRMATION),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.ACCOUNT_CONFIRMATION} />
            <AccountConfirmation />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.REQUEST_PASSWORD_RESET),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.REQUEST_PASSWORD_RESET} />
            <RequestPasswordReset />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.RESET_PASSWORD),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.RESET_PASSWORD} />
            <ResetPasswordConfirm />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.REQUEST_EMAIL_VERIFICATION),
        element: (
          <OpenRoute>
            <PageTitle title={PAGE_TITLES.REQUEST_EMAIL_VERIFICATION} />
            <RequestEmailVerification />
          </OpenRoute>
        ),
      },
      {
        path: normalizeRoutePath(ROUTES.PAYMENT_CALLBACK),
        element: (
          <OpenRoute skipAuthRedirect={true}>
            <PageTitle title={PAGE_TITLES.PAYMENT_CALLBACK} />
            <PaymentCallback />
          </OpenRoute>
        ),
      },
    ],
  },
];
