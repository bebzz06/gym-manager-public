import { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch } from './hooks/useAppDispatch';
import { validateSession } from './http/Auth';
import { Loader } from './common/Loader';
import { initializeSuccess } from './store/slices/appSlice';
import {
  initializeAuthStart,
  initializeAuthSuccess,
  initializeAuthFailure,
} from './store/slices/authSlice';
import { useAppSelector } from './hooks/useAppSelector';

const App: React.FC = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { isInitialized } = useAppSelector(state => state.app);

  useEffect(() => {
    const init = async () => {
      try {
        const { valid } = await validateSession();
        dispatch(initializeAuthStart());
        if (valid) {
          dispatch(initializeSuccess());
          dispatch(initializeAuthSuccess());
        } else {
          dispatch(initializeSuccess());
          dispatch(initializeAuthFailure());
        }
      } catch (error) {
        console.error('Init error:', error);
        dispatch(initializeSuccess());
      }
    };
    init();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!isInitialized) {
    return <Loader />;
  }

  return (
    <>
      <Toaster />
      <Outlet />
    </>
  );
};

export default App;
