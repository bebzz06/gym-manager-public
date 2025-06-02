import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import SecuredRoute from '@/router/guards/SecuredRoute';
import { ROUTES, PAGE_TITLES } from '@/constants';
import PageTitle from '@/components/PageTitle';
import { ROUTE_ACCESS } from '@/constants/permissions';

const Profile = lazy(() => import('@/pages/Profile/Profile'));
const Settings = lazy(() => import('@/pages/Settings/Settings'));
const ComingSoon = lazy(() => import('@/pages/Pages/ComingSoon'));
const Members = lazy(() => import('@/pages/Members/Members'));
const EditMember = lazy(() => import('@/pages/Members/EditMember'));
const RegistrationLinks = lazy(() => import('@/pages/RegistrationLinks/RegistrationLinks'));
const MembershipPlans = lazy(() => import('@/pages/MembershipPlans/MembershipPlans'));
const Payments = lazy(() => import('@/pages/Payments/Payments'));
const getRelativePath = (path: string) => path.replace(`${ROUTES.DASHBOARD.ROOT}/`, '');

export const securedRoutes: RouteObject[] = [
  {
    path: ROUTES.DASHBOARD.ROOT,
    element: <DashboardLayout />,
    children: [
      {
        path: getRelativePath(ROUTES.DASHBOARD.PROFILE),
        element: (
          <SecuredRoute allowedRoles={ROUTE_ACCESS[ROUTES.DASHBOARD.PROFILE]}>
            <PageTitle title={PAGE_TITLES.PROFILE} />
            <Profile />
          </SecuredRoute>
        ),
      },
      {
        path: getRelativePath(ROUTES.DASHBOARD.SETTINGS),
        element: (
          <SecuredRoute allowedRoles={ROUTE_ACCESS[ROUTES.DASHBOARD.SETTINGS]}>
            <PageTitle title={PAGE_TITLES.SETTINGS} />
            <Settings />
          </SecuredRoute>
        ),
      },

      {
        path: getRelativePath(ROUTES.DASHBOARD.MEMBERS),
        element: (
          <SecuredRoute allowedRoles={ROUTE_ACCESS[ROUTES.DASHBOARD.MEMBERS]}>
            <PageTitle title={PAGE_TITLES.MEMBERS} />
            <Members />
          </SecuredRoute>
        ),
      },
      {
        path: getRelativePath(ROUTES.DASHBOARD.EDIT_MEMBER),
        element: (
          <SecuredRoute allowedRoles={ROUTE_ACCESS[ROUTES.DASHBOARD.EDIT_MEMBER]}>
            <PageTitle title={PAGE_TITLES.EDIT_MEMBER} />
            <EditMember />
          </SecuredRoute>
        ),
      },
      {
        path: getRelativePath(ROUTES.DASHBOARD.REGISTRATION_LINKS),
        element: (
          <SecuredRoute allowedRoles={ROUTE_ACCESS[ROUTES.DASHBOARD.REGISTRATION_LINKS]}>
            <PageTitle title={PAGE_TITLES.REGISTRATION_LINKS} />
            <RegistrationLinks />
          </SecuredRoute>
        ),
      },
      {
        path: ROUTES.DASHBOARD.MEMBERSHIP_PLANS,
        element: (
          <SecuredRoute allowedRoles={ROUTE_ACCESS[ROUTES.DASHBOARD.MEMBERSHIP_PLANS]}>
            <PageTitle title={PAGE_TITLES.MEMBERSHIP_PLANS} />
            <MembershipPlans />
          </SecuredRoute>
        ),
      },
      {
        path: ROUTES.DASHBOARD.PAYMENTS,
        element: (
          <SecuredRoute allowedRoles={ROUTE_ACCESS[ROUTES.DASHBOARD.PAYMENTS]}>
            <PageTitle title={PAGE_TITLES.PAYMENTS} />
            <Payments />
          </SecuredRoute>
        ),
      },
    ],
  },
  {
    path: ROUTES.COMING_SOON,
    element: (
      <SecuredRoute allowedRoles={ROUTE_ACCESS[ROUTES.COMING_SOON]}>
        <PageTitle title={PAGE_TITLES.COMING_SOON} />
        <ComingSoon />
      </SecuredRoute>
    ),
  },
];
