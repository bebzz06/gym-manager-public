import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/images/logo/output-onlinepngtools.png';
import AuthDecoration from '@/images/auth/auth-decoration.svg';
import { getSubdomain } from '@/utils';
import { Loader } from '@/common/Loader';
interface AuthPagesLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  loading?: boolean;
}

const AuthPagesLayout: React.FC<AuthPagesLayoutProps> = ({
  children,
  title,
  subtitle,
  loading = false,
}) => {
  const subdomain = getSubdomain();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-start">
        <div className="hidden w-full xl:block xl:w-1/2">
          <div className="py-17.5 px-26 text-center">
            <Link className="flex items-center" to="/">
              <img src={Logo} alt="Logo" className="w-20 h-20" />
              <h2 className="text-black dark:text-white text-4xl font-bold text-center mt-4">
                Dojo Manager
              </h2>
            </Link>

            <p className="2xl:px-20">{subtitle || `Sign in to your ${subdomain} account.`}</p>

            <span className="mt-15 inline-block">
              <img src={AuthDecoration} alt="Auth Decoration" />
            </span>
          </div>
        </div>

        <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
          <div className="w-full min-h-screen p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
              {title}
            </h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPagesLayout;
