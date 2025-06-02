import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { EmailIcon } from '@/components/Icons';
import { resendVerificationEmail } from '@/http/Auth';
import { ROUTES } from '@/constants/routes';
import AuthPagesLayout from '@/layouts/AuthPagesLayout';

const RequestEmailVerification: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resendVerificationEmail(email);
      toast.success('Verification link has been sent to your email');
      setEmail(''); // Clear form after success
    } catch (err: any) {
      if (err.isRateLimit) {
        setIsRateLimited(true);
        toast.error(err.response?.data?.message || 'Too many attempts. Please try again later.');
      } else {
        const errorMessage =
          err.response?.data?.message || 'Failed to send verification link. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPagesLayout
      title="Request Email Verification"
      subtitle="Request a new verification link for your account."
      loading={loading}
    >
      <p className="mb-7.5 text-sm text-gray-600 dark:text-gray-400">
        Enter your email address and we'll send you a new verification link.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="mb-2.5 block font-medium text-black dark:text-white">Email</label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <span className="absolute right-4 top-4">
              <EmailIcon />
            </span>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

        <button
          type="submit"
          disabled={loading || isRateLimited}
          className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Verification Link'}
        </button>

        <div className="mt-6 text-center">
          <Link to={ROUTES.SIGNIN} className="text-primary">
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthPagesLayout>
  );
};

export default RequestEmailVerification;
