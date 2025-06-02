import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmAccount } from '@/http/Auth';
import { toast } from 'react-hot-toast';
import { ROUTES } from '@/constants/routes';
import { CreatePasswordModal } from './CreatePasswordModal';

const AccountConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    if (!token) {
      setError('Verification token is missing');
      toast.error('Verification token is missing');
      return;
    }

    try {
      const response = await confirmAccount(token);
      if (response.needsPasswordSetup) {
        setVerificationToken(token);
        setShowPasswordModal(true);
        return;
      }
      setTimeout(() => {
        navigate(ROUTES.SIGNIN);
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSetupSuccess = () => {
    setLoading(false);
    toast.success('Email verified successfully!');
    setTimeout(() => {
      navigate(ROUTES.SIGNIN);
    }, 3000);
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 py-10 shadow-default dark:border-strokedark dark:bg-boxdark sm:py-20 min-h-screen">
        <div className="mx-auto max-w-[490px] text-center">
          <div className="flex flex-col items-center">
            {loading ||
              (showPasswordModal && (
                <>
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                  <p className="mt-4 font-medium">Verifying your email...</p>
                </>
              ))}
            {error && (
              <>
                <div className="mb-4">
                  <svg
                    className="h-16 w-16 text-red-500"
                    fill="red"
                    stroke="red"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </div>
                <h2 className="mb-3 text-2xl font-bold text-black dark:text-white">
                  Email Verification Failed
                </h2>
                <p className="font-medium text-bodydark2">{error}</p>
              </>
            )}
            {!loading && !error && !showPasswordModal && (
              <>
                <div className="mb-4 text-green-500">
                  <svg
                    className="h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
                <h2 className="mb-3 text-2xl font-bold text-black dark:text-white">
                  Email Verified Successfully!
                </h2>
                <p className="font-medium text-bodydark2">
                  Your email has been verified. Redirecting to sign in page...
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {showPasswordModal && verificationToken && (
        <CreatePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          token={verificationToken}
          onSuccess={handlePasswordSetupSuccess}
        />
      )}
    </>
  );
};

export default AccountConfirmation;
