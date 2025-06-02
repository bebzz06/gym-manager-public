import { CloseIcon } from '@/components/Icons';
import { formatAmount } from '@shared/utils';
import { formatDateForDisplay } from '@/utils/date';
import { formatToTitleCase } from '@/utils';
import { IPaymentTransactionData } from '@shared/types/payment.types';

interface PaymentTransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: IPaymentTransactionData | null;
}

export const PaymentTransactionDetailsModal: React.FC<PaymentTransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5">
      <div className="relative w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-8 py-4 dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
              Transaction Details
            </h3>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-black transition hover:bg-white hover:text-primary dark:text-white"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-8 py-8">
          <div className="space-y-6">
            <div>
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Payment Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Amount
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatAmount(transaction.amount)} {transaction.currency}
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatToTitleCase(transaction.status)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Transaction Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Type
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatToTitleCase(transaction.type)}
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Description
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {transaction.invoicing.items.map(item => item.description).join(', ')}
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Payment Method
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatToTitleCase(transaction.paymentMethod)}
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Date
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDateForDisplay(transaction.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Processing Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Payment By
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {transaction.paymentBy.firstName} {transaction.paymentBy.lastName}
                  </p>
                </div>
                {transaction.metadata?.cardType && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Card Type
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatToTitleCase(transaction.metadata.cardType)}
                    </p>
                  </div>
                )}
                {transaction.receivedBy && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Received By
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {transaction.receivedBy.firstName} {transaction.receivedBy.lastName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {transaction.notes && (
              <div>
                <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">Notes</h4>
                <p className="text-gray-600 dark:text-gray-400">{transaction.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
