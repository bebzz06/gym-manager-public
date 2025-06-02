import { ROUTES } from '@/constants/routes';
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-boxdark">
      <div className="rounded-sm border border-stroke bg-white px-5 py-10 shadow-default dark:border-strokedark dark:bg-boxdark sm:py-20">
        <div className="mx-auto max-w-[500px] text-center">
          <h2 className="mb-5 text-3xl font-bold text-black dark:text-white">
            Welcome to Dojo Manager
          </h2>
          <p className="mb-12 font-medium text-lg">
            Your comprehensive gym and martial arts academy management solution
          </p>

          <div className="flex flex-col gap-6">
            <Link
              to="/signin"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary py-4 px-10 font-medium text-white hover:bg-opacity-90"
            >
              <span>Sign In</span>
              <span>
                <svg
                  className="fill-current"
                  width="16"
                  height="14"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14.7492 6.38125H2.73984L7.52109 1.51562C7.77422 1.2625 7.77422 0.86875 7.52109 0.615625C7.26797 0.3625 6.87422 0.3625 6.62109 0.615625L0.799219 6.52187C0.546094 6.775 0.546094 7.16875 0.799219 7.42188L6.62109 13.3281C6.73359 13.4406 6.90234 13.525 7.07109 13.525C7.23984 13.525 7.38047 13.4687 7.52109 13.3562C7.77422 13.1031 7.77422 12.7094 7.52109 12.4563L2.76797 7.64687H14.7492C15.0867 7.64687 15.368 7.36562 15.368 7.02812C15.368 6.6625 15.0867 6.38125 14.7492 6.38125Z" />
                </svg>
              </span>
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-primary py-4 px-10 font-medium text-primary hover:bg-primary hover:text-white"
            >
              <span>Create Account</span>
            </Link>
          </div>

          <p className="mt-8 text-sm text-body">
            By signing up, you agree to our{' '}
            <Link to={ROUTES.TERMS_CONDITIONS} className="text-primary hover:underline">
              Terms and Conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
