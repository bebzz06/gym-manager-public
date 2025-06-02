import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from './useAppSelector';
import { ROUTES } from '@/constants/routes';
import { SESSION_MESSAGES } from '@shared/constants/messages';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, error } = useAppSelector(state => state.auth);
  const { loading } = useAppSelector(state => state.profile);

  useEffect(() => {
    if (!isAuthenticated && !loading && error === SESSION_MESSAGES.ERRORS.INVALID) {
      navigate(ROUTES.SIGNIN, {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, loading, error, navigate, location]);

  return { isAuthenticated, loading };
};
