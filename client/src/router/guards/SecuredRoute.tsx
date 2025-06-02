import { FC, ReactNode, useEffect, Suspense, useState } from 'react';
import { useAccessControl } from '@/hooks/useAccessControl';
import { Loader } from '@/common/Loader';
import { TUserRole } from '@shared/types/user.types';
import { useUserSession } from '@/hooks/useUserSession';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useLocation, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

interface SecuredRouteProps {
  children: ReactNode;
  allowedRoles?: TUserRole[];
}

const SecuredRoute: FC<SecuredRouteProps> = ({ children, allowedRoles = [] }) => {
  const { loading, validateAccess, isAuthenticated } = useAccessControl();
  const { fetchUserSession } = useUserSession();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState(true);
  useAuthRedirect();

  useEffect(() => {
    const initSession = async () => {
      try {
        const userData = await fetchUserSession();
        const accessGranted = validateAccess(allowedRoles, userData.role);
        setHasAccess(accessGranted);
      } catch (error) {
        console.error('Session init error:', error);
      }
    };

    initSession();
  }, [location.pathname]);
  if (loading) {
    return <Loader />;
  }

  // Redirect to unauthorized page if access is denied
  if (!hasAccess) {
    return <Navigate to={ROUTES.UNAUTHORIZED} state={{ from: location }} replace />;
  }
  //Redirect to unauthorized page if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.UNAUTHORIZED} state={{ from: location }} replace />;
  }

  return <Suspense fallback={<Loader />}>{children}</Suspense>;
};

export default SecuredRoute;
