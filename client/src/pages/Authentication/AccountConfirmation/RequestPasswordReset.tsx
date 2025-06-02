import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { EmailIcon } from '@/components/Icons';
import { requestPasswordReset, resendVerificationEmail } from '@/http/Auth';
import { ROUTES } from '@/constants/routes';
import AuthPagesLayout from '@/layouts/AuthPagesLayout';

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowResendEmail(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      toast.success('Password reset link has been sent to your email');
      setEmail(''); // Clear form after success
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setError(errorMessage);

      // Check if email verification is needed
      if (err.response?.data?.needsVerification) {
        setShowResendEmail(true);
        toast.error('Please verify your email before resetting your password');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsResendingEmail(true);
      await resendVerificationEmail(email);
      toast.success('Verification email has been resent. Please check your inbox.');
      setIsRateLimited(false);
    } catch (error: any) {
      if (error.isRateLimit) {
        setIsRateLimited(true);
        toast.error(error.response.data.message || 'Too many attempts. Please try again later.');
      } else {
        setIsRateLimited(false);
        toast.error('Failed to resend verification email. Please try again.');
      }
    } finally {
      setIsResendingEmail(false);
    }
  };

  return (
    <AuthPagesLayout
      title="Reset Password"
      subtitle="Reset your password by entering your email address."
      loading={loading}
    >
      <p className="mb-7.5 text-sm text-gray-600 dark:text-gray-400">
        Enter your email address and we'll send you instructions to reset your password.
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
          disabled={loading}
          className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <div className="mt-6 text-center">
          <Link to={ROUTES.SIGNIN} className="text-primary">
            Back to Sign In
          </Link>
        </div>
      </form>

      {showResendEmail && (
        <div className="mt-6 text-center">
          <p>
            Didn't receive the verification email? Please check your spam folder or request a new
            verification link.
          </p>
          <button
            onClick={handleResendVerification}
            disabled={isResendingEmail || isRateLimited}
            className="mt-6 inline-flex items-center justify-center rounded-md border border-primary py-3 px-6 font-medium text-primary hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isRateLimited ? 'Too Many Attempts' : undefined}
          >
            {isResendingEmail
              ? 'Sending...'
              : isRateLimited
                ? 'Too Many Attempts'
                : 'Resend Verification Email'}
          </button>
        </div>
      )}
    </AuthPagesLayout>
  );
};

export default RequestPasswordReset;
