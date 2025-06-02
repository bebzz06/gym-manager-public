import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Illustration from '@/images/illustration/illustration-02.svg';
import { resendVerificationEmail } from '@/http/Auth';

const RegistrationConfirmation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const location = useLocation();
  const email = location.state?.email;

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await resendVerificationEmail(email);
      setMessage('Verification email has been resent. Please check your inbox.');
      setIsRateLimited(false);
    } catch (error: any) {
      if (error.isRateLimit) {
        setIsRateLimited(true);
        setMessage(error.response.data.message || 'Too many attempts. Please try again later.');
      } else {
        setIsRateLimited(false);
        setMessage('Failed to resend verification email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 py-10 shadow-default dark:border-strokedark dark:bg-boxdark sm:py-20 min-h-screen">
      <div className="mx-auto max-w-[490px]">
        <img src={Illustration} alt="illustration" />

        <div className="mt-7.5 text-center">
          <h2 className="mb-3 text-2xl font-bold text-black dark:text-white">
            Please Verify Your Email!
          </h2>
          <p className="font-medium mb-3">
            We have sent a verification link to your email address. Please check your inbox and
            click the link to verify your account.
          </p>
          <p className="text-sm text-bodydark2">
            Didn't receive the email? Please check your spam folder or request a new verification
            link.
          </p>
          {message && (
            <p
              className={`mt-2 text-sm ${
                message.includes('success')
                  ? 'text-success'
                  : isRateLimited
                    ? 'text-warning'
                    : 'text-danger'
              }`}
            >
              {message}
            </p>
          )}
          <div className="mt-7.5 flex flex-col gap-3">
            <button
              onClick={handleResendVerification}
              disabled={loading || isRateLimited}
              className="inline-flex items-center justify-center rounded-md border border-primary py-3 px-6 font-medium text-primary hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isRateLimited ? message : undefined}
            >
              {loading
                ? 'Sending...'
                : isRateLimited
                  ? 'Too Many Attempts'
                  : 'Resend Verification Email'}
            </button>
            <Link
              to="/signin"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary py-3 px-6 font-medium text-white hover:bg-opacity-90"
            >
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;
