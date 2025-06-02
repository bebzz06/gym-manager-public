import { useState, useCallback } from 'react';
import { getPagueloFacilPaymentLink } from '@/http/Payment';
import { toast } from 'react-hot-toast';
import { TPaymentTransactionType } from '@shared/types/payment.types';
import { AxiosError } from 'axios';

interface PagueloFacilButtonProps {
  itemId: string;
  itemType: TPaymentTransactionType;
}

export const PagueloFacilButton: React.FC<PagueloFacilButtonProps> = ({ itemId, itemType }) => {
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePaymentClick = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPagueloFacilPaymentLink({
        purchasedItemId: itemId,
        purchasedItemType: itemType,
      });

      if (response?.success && response?.data?.paymentUrl) {
        setIsRedirecting(true);
        window.location.assign(response.data.paymentUrl);
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error(
        error instanceof AxiosError ? error.response?.data?.message : 'Failed to initiate payment'
      );
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  return (
    <button
      onClick={handlePaymentClick}
      disabled={loading || isRedirecting}
      className="inline-flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[40px] min-w-[150px]"
    >
      {loading ? (
        <span>Processing...</span>
      ) : isRedirecting ? (
        <span>Redirecting to payment...</span>
      ) : (
        <>
          {!imageLoaded && (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading payment method...</span>
            </div>
          )}
          <img
            src="https://assets.paguelofacil.com/images/btn-svg/btn_es.svg"
            alt="Pagar con Paguelo Facil"
            className={`h-18 w-auto ${imageLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              toast.error('Payment button failed to load');
            }}
          />
        </>
      )}
    </button>
  );
};
