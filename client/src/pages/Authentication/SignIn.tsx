import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '@/http/Auth';
import { EmailIcon, PasswordIcon } from '@/components/Icons';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearLoginFailure,
} from '@/store/slices/authSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { ROUTES } from '@/constants';
import { TUserRole } from '@shared/types/user.types';
import { UserRole } from '@shared/constants/user';
import { getSubdomain } from '@/utils';
import AuthPagesLayout from '@/layouts/AuthPagesLayout';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const error = useAppSelector(state => state.auth.error);
  const { loading } = useAppSelector(state => state.profile);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const subdomain = getSubdomain();

  useEffect(() => {
    if (error?.includes('verify')) {
      setShowResendEmail(true);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSuccessfulLogin = (role: TUserRole) => {
    if (role === UserRole.OWNER || role === UserRole.ADMIN) {
      navigate(ROUTES.DASHBOARD.MEMBERS);
    } else {
      navigate(ROUTES.DASHBOARD.PROFILE);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic client-side validation
    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Please fill in all fields'));
      return;
    }
    try {
      dispatch(loginStart());

      const response = await login(formData.email, formData.password);
      const { role } = response.user;

      dispatch(loginSuccess());

      handleSuccessfulLogin(role);
    } catch (err: any) {
      if (err.response?.data?.needsVerification) {
        console.log('Error caught with needsVerification');
        toast.error('Check your inbox for verification link');
      }
      const errorMessage = err.response?.data?.message || 'Invalid credentials. Please try again.';
      dispatch(loginFailure(errorMessage));
    }
  };
  const handleRequestEmailVerification = async () => {
    navigate(ROUTES.REQUEST_EMAIL_VERIFICATION);
    dispatch(clearLoginFailure());
  };

  return (
    <AuthPagesLayout title={`Sign In to ${subdomain}`} loading={loading}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">Email</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <span className="absolute right-4 top-4">
              <EmailIcon />
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2.5 block font-medium text-black dark:text-white">Password</label>
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <span className="absolute right-4 top-4">
              <PasswordIcon />
            </span>
          </div>
        </div>

        {error && <div className="mb-4 text-danger text-red-500">{error}</div>}

        <div className="mb-5">
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">Signing in</span>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p>
            Forgot password?{' '}
            <Link to={ROUTES.REQUEST_PASSWORD_RESET} className="text-primary">
              Reset Password
            </Link>
          </p>
        </div>
      </form>

      {showResendEmail && (
        <div className="mt-6 text-center">
          <p>
            Didn't receive the email? Please check your spam folder or request a new verification
            link.
          </p>
          <button
            onClick={handleRequestEmailVerification}
            className="mt-6 inline-flex items-center justify-center rounded-md border border-primary py-3 px-6 font-medium text-primary hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Email Verification
          </button>
        </div>
      )}
    </AuthPagesLayout>
  );
};

export default SignIn;
