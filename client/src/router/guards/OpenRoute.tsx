import { FC, ReactNode, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Loader } from '@/common/Loader';
import { ROUTES } from '@/constants/routes';

interface OpenRouteProps {
  children: ReactNode;
  skipAuthRedirect?: boolean;
}

const OpenRoute: FC<OpenRouteProps> = ({ children, skipAuthRedirect = false }) => {
  const { isAuthenticated, loading } = useAccessControl();

  const location = useLocation();
  if (loading) {
    return <Loader />;
  }
  if (isAuthenticated && !skipAuthRedirect) {
    return <Navigate to={ROUTES.DASHBOARD.PROFILE} replace state={{ from: location }} />;
  }
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
};

export default OpenRoute;
