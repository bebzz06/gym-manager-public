import { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { Loader } from '@/common/Loader';
import { openRoutes } from './routes/open.routes';
import { securedRoutes } from './routes/secured.routes';
import { ROUTES } from '@/constants/routes';
import { normalizeRoutePath } from './routes/open.routes';
import App from '@/App';

// Lazy load error boundary
const ErrorPage = lazy(() => import('@/pages/Pages/ErrorPage'));
const Unauthorized = lazy(() => import('@/pages/Pages/Unauthorized'));

// Combine all routes
export const routes: RouteObject[] = [
  {
    element: <App />,
    errorElement: (
      <Suspense fallback={<Loader />}>
        <ErrorPage />
      </Suspense>
    ),
    children: [
      ...openRoutes,
      ...securedRoutes,
      {
        path: normalizeRoutePath(ROUTES.UNAUTHORIZED),
        element: (
          <Suspense fallback={<Loader />}>
            <Unauthorized />
          </Suspense>
        ),
      },
    ],
  },
];
