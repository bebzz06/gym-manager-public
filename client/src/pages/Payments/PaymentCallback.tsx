import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPagueloFacilPayment } from '@/http/Payment';
import { ROUTES } from '@/constants/routes';
import { toast } from 'react-hot-toast';
import { PaymentStatus } from '@shared/constants/payment';
type PaymentStatus = 'loading' | 'success' | 'error';
type ErrorType = 'no_payment_id' | 'verification_failed' | 'already_processed' | null;

export const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [error, setError] = useState<ErrorType>(null);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  useEffect(() => {
    const verifyTransaction = async () => {
      try {
        const queryParams = {
          paymentId: searchParams.get('paymentId'),
          TotalPagado: searchParams.get('TotalPagado'),
          Estado: searchParams.get('Estado'),
          Tipo: searchParams.get('Tipo'),
          Oper: searchParams.get('Oper'),
          Razon: searchParams.get('Razon'),
        };

        const response = await verifyPagueloFacilPayment(queryParams as Record<string, string>);

        if (!response.success && response.data?.status === PaymentStatus.COMPLETED) {
          setStatus('error');
          setError('already_processed');
          return;
        }

        if (response.success) {
          setStatus('success');
          toast.success('Payment verified successfully!');
          setTimeout(() => {
            navigate(ROUTES.DASHBOARD.PROFILE);
          }, 2000);
        } else {
          if (attempts < MAX_ATTEMPTS) {
            setAttempts(prev => prev + 1);
            setTimeout(verifyTransaction, 2000);
          } else {
            setStatus('error');
            setError('verification_failed');
          }
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setError('verification_failed');
        toast.error(error.message || 'Error verifying payment');
      }
    };

    if (status === 'loading') {
      verifyTransaction();
    }
  }, [searchParams, navigate, attempts, status]);

  const getErrorMessage = () => {
    switch (error) {
      case 'no_payment_id':
        return 'No payment ID was provided. Please contact support if this issue persists.';
      case 'verification_failed':
        return 'We could not verify your payment at this time. Please contact support for assistance.';
      case 'already_processed':
        return 'This payment has already been processed. Please check your profile for details.';
      default:
        return 'An unexpected error occurred. Please contact support.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {status === 'loading' && (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Verifying Payment...</h2>
          <p className="text-gray-600">
            {attempts > 0 && `Attempt ${attempts} of ${MAX_ATTEMPTS}`}
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-green-600 mb-4">Payment Successful!</h2>
          <p>Redirecting...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Payment Verification Failed</h2>
          <p className="mb-4">{getErrorMessage()}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(ROUTES.DASHBOARD.PROFILE)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Go to Profile
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;
