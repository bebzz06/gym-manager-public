import { IMenuGroup } from '@/types/sidebar.types';
import { ROUTES, TITLES } from '@/constants';
import {
  DashboardIcon,
  CalendarIcon,
  ProfileIcon,
  SettingsIcon,
  // TasksIcon,
  // FormsIcon,
  // ElementsIcon,
  // AuthIcon,
  CreditCardIcon,
  MembersIcon,
} from '@/components/Icons';

export const BADGE_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
} as const;
export const BADGE_TEXT = 'Pro' as const;
export const menuItems: IMenuGroup[] = [
  {
    title: 'SERVICES',
    items: [
      {
        title: TITLES.MEMBERS,
        path: ROUTES.DASHBOARD.MEMBERS,
        icon: <MembersIcon />,
        access: 'MEMBERS',
      },
      {
        title: TITLES.REGISTRATION_LINKS,
        path: ROUTES.DASHBOARD.REGISTRATION_LINKS,
        icon: <SettingsIcon />,
        access: 'REGISTRATION_LINKS',
      },
      // {
      //   title: TITLES.DASHBOARD,
      //   path: ROUTES.DASHBOARD.ROOT,
      //   icon: <DashboardIcon />,
      //   submenu: [
      //     {
      //       title: TITLES.ECOMMERCE,
      //       path: ROUTES.DASHBOARD.ECOMMERCE,
      //     },
      //     {
      //       title: TITLES.ANALYTICS,
      //       path: ROUTES.DASHBOARD.ANALYTICS,
      //       badge: {
      //         text: BADGE_TEXT,
      //         variant: BADGE_VARIANTS.PRIMARY,
      //       },
      //     },
      //     {
      //       title: TITLES.MARKETING,
      //       path: ROUTES.DASHBOARD.MARKETING,
      //       badge: {
      //         text: BADGE_TEXT,
      //         variant: BADGE_VARIANTS.PRIMARY,
      //       },
      //     },
      //     {
      //       title: TITLES.CRM,
      //       path: ROUTES.DASHBOARD.CRM,
      //       badge: {
      //         text: BADGE_TEXT,
      //         variant: BADGE_VARIANTS.PRIMARY,
      //       },
      //     },
      //     {
      //       title: TITLES.STOCKS,
      //       path: ROUTES.DASHBOARD.STOCKS,
      //       badge: {
      //         text: BADGE_TEXT,
      //         variant: BADGE_VARIANTS.PRIMARY,
      //       },
      //     },
      //   ],
      // },
      {
        title: TITLES.ATTENDANCE,
        path: ROUTES.COMING_SOON,
        icon: <CalendarIcon />,
      },
      {
        title: TITLES.PROFILE,
        path: ROUTES.DASHBOARD.PROFILE,
        access: 'PROFILE',
        icon: <ProfileIcon />,
      },
      {
        title: TITLES.MEMBERSHIP_PLANS,
        path: ROUTES.DASHBOARD.MEMBERSHIP_PLANS,
        access: 'MEMBERSHIP_PLANS',
        icon: <DashboardIcon />,
      },
      {
        title: TITLES.PAYMENTS,
        path: ROUTES.DASHBOARD.PAYMENTS,
        access: 'PAYMENTS',
        icon: <CreditCardIcon />,
      },
      // {
      //   title: 'Tasks',
      //   path: '/tasks',
      //   icon: <TasksIcon />,
      //   submenu: [
      //     {
      //       title: 'List',
      //       path: '/tasks/task-list',
      //       badge: {
      //         text: 'Pro',
      //         variant: BADGE_VARIANTS.PRIMARY,
      //       },
      //     },
      //     {
      //       title: 'Kanban',
      //       path: '/tasks/task-kanban',
      //       badge: {
      //         text: 'Pro',
      //         variant: BADGE_VARIANTS.PRIMARY,
      //       },
      //     },
      //   ],
      // },
      // {
      //   title: 'Forms',
      //   path: '/forms',
      //   icon: <FormsIcon />,
      //   submenu: [
      //     {
      //       title: 'Form Elements',
      //       path: '/forms/form-elements',
      //     },
      //     {
      //       title: 'Pro Form Elements',
      //       path: '/forms/pro-form-elements',
      //       badge: {
      //         text: 'Pro',
      //         variant: BADGE_VARIANTS.PRIMARY,
      //       },
      //     },
      //     {
      //       title: 'Form Layout',
      //       path: '/forms/form-layout',
      //     },
      //     {
      //       title: 'Pro Form Layout',
      //       path: '/forms/pro-form-layout',
      //       badge: {
      //         text: 'Pro',
      //         variant: BADGE_VARIANTS.PRIMARY,
      //       },
      //     },
      //   ],
      // },
    ],
  },
  // {
  //   title: 'UI Elements',
  //   items: [
  //     {
  //       title: 'UI Elements',
  //       path: '/ui',
  //       icon: <ElementsIcon />,
  //       submenu: [
  //         {
  //           title: 'Alerts',
  //           path: '/ui/alerts',
  //         },
  //         {
  //           title: 'Buttons',
  //           path: '/ui/buttons',
  //         },
  //         {
  //           title: 'Breadcrumbs',
  //           path: ROUTES.UI.BREADCRUMBS,
  //           badge: {
  //             text: 'Pro',
  //             variant: BADGE_VARIANTS.PRIMARY,
  //           },
  //         },
  //         {
  //           title: 'Tabs',
  //           path: ROUTES.UI.TABS,
  //           badge: {
  //             text: 'Pro',
  //             variant: BADGE_VARIANTS.PRIMARY,
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   title: 'Authentication',
  //   items: [
  //     {
  //       title: 'Authentication',
  //       path: '/auth',
  //       icon: <AuthIcon />,
  //       submenu: [
  //         {
  //           title: 'Sign In',
  //           path: ROUTES.AUTH.SIGNIN,
  //         },
  //         {
  //           title: 'Sign Up',
  //           path: ROUTES.AUTH.SIGNUP,
  //         },
  //         {
  //           title: 'Reset Password',
  //           path: '/auth/reset-password',
  //           badge: {
  //             text: 'Pro',
  //             variant: BADGE_VARIANTS.PRIMARY,
  //           },
  //         },
  //         {
  //           title: 'Coming Soon',
  //           path: '/auth/coming-soon',
  //           badge: {
  //             text: 'Pro',
  //             variant: BADGE_VARIANTS.PRIMARY,
  //           },
  //         },
  //         {
  //           title: '2 Step Verification',
  //           path: '/auth/two-step-verification',
  //           badge: {
  //             text: 'Pro',
  //             variant: BADGE_VARIANTS.PRIMARY,
  //           },
  //         },
  //         {
  //           title: 'Under Maintenance',
  //           path: '/auth/under-maintenance',
  //           badge: {
  //             text: 'Pro',
  //             variant: BADGE_VARIANTS.PRIMARY,
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },
];
