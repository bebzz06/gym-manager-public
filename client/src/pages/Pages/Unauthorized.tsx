import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAccessControl } from '@/hooks/useAccessControl';
const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAccessControl();

  const handleGoBack = () => {
    navigate(isAuthenticated ? ROUTES.HOME : ROUTES.SIGNIN);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-10 shadow-default dark:border-strokedark dark:bg-boxdark sm:py-20 min-h-screen">
      <div className="mx-auto max-w-[490px]">
        <div className="mt-7.5 text-center">
          <h2 className="mb-3 text-2xl font-bold text-black dark:text-white">Access Denied</h2>
          <p className="font-medium mb-5">Sorry, you don't have permission to access this page.</p>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 rounded-md bg-primary py-3 px-6 font-medium text-white hover:bg-opacity-90"
          >
            <span>{isAuthenticated ? 'Go Back' : 'Sign In'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
