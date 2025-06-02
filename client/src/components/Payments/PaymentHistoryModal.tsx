import { CloseIcon } from '@/components/Icons';
import { formatAmount } from '@shared/utils';
import { formatDateForDisplay } from '@/utils/date';
import { formatToTitleCase } from '@/utils';
import { IPaymentHistoryItem } from '@/types/user.types';
import { useState } from 'react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: IPaymentHistoryItem[];
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  payments,
}) => {
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5">
      <div className="relative w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark">
        <div className="sticky top-0 z-10 bg-white px-8 py-4 dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
              Payment History
            </h3>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-black transition hover:bg-white hover:text-primary dark:text-white"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-8 py-8">
          <div className="divide-y divide-stroke">
            {payments.map(payment => (
              <div key={payment._id} className="py-4">
                <button
                  onClick={() =>
                    setExpandedPayment(expandedPayment === payment._id ? null : payment._id)
                  }
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <h4 className="text-md font-medium text-black dark:text-white">
                      {payment.purchasedItem.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDateForDisplay(payment.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-md font-medium text-black dark:text-white">
                      {formatAmount(payment.amount)} {payment.currency}
                    </p>
                    <span className="text-sm text-primary">
                      {expandedPayment === payment._id ? '↑ Less details' : '↓ More details'}
                    </span>
                  </div>
                </button>

                {expandedPayment === payment._id && (
                  <div className="mt-4 pl-4 border-l-2 border-stroke">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-black dark:text-white">
                          Type
                        </label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatToTitleCase(payment.type)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white px-8 py-4 dark:bg-boxdark">
          <div className="flex justify-center sm:justify-end gap-4.5">
            <button
              onClick={onClose}
              className="flex justify-center items-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
