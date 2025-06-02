import { IPaymentHistoryItem } from '@/types/user.types';
import { formatToTitleCase } from '@/utils';
import { formatDateForDisplay } from '@/utils/date';
import { SubscriptionStatus } from '@shared/constants/subscription';
import { useState } from 'react';
import { PaymentHistoryModal } from '../Payments/PaymentHistoryModal';

interface MembershipInfoProps {
  membershipInfo?: {
    status?: string;
    endDate?: string;
    plan?: {
      name: string;
    };
    lastPayment?: string;
  };
  paymentHistory?: {
    payments: IPaymentHistoryItem[];
    hasPayments: boolean;
    pagination: {
      cursor: string | null;
      limit: number;
      hasMore: boolean;
    };
  };
}

export const MembershipInformation = ({ membershipInfo, paymentHistory }: MembershipInfoProps) => {
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);

  return (
    <>
      <div className="px-7 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 dark:border-strokedark mb-5.5">
          <h3 className="font-medium text-black dark:text-white">Membership Information</h3>
        </div>

        <div className="flex flex-col gap-4 mb-5.5">
          {membershipInfo?.status === SubscriptionStatus.ACTIVE ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Status
                </label>
                <p className="text-gray-600 dark:text-gray-400">
                  {formatToTitleCase(membershipInfo.status)}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Valid Until
                </label>
                <p className="text-gray-600 dark:text-gray-400">
                  {membershipInfo.endDate && formatDateForDisplay(membershipInfo.endDate)}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Plan
                </label>
                <p className="text-gray-600 dark:text-gray-400">{membershipInfo.plan?.name}</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Last Payment
                </label>
                <p className="text-gray-600 dark:text-gray-400">
                  {membershipInfo.lastPayment && formatDateForDisplay(membershipInfo.lastPayment)}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 py-4">No active membership plan</p>
          )}

          <div className="mt-2">
            {paymentHistory?.hasPayments ? (
              <button
                onClick={() => setIsPaymentHistoryModalOpen(true)}
                className="text-sm text-primary hover:text-opacity-90"
              >
                View Payment History →
              </button>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No payment records available
              </p>
            )}
          </div>
        </div>
      </div>

      <PaymentHistoryModal
        isOpen={isPaymentHistoryModalOpen}
        onClose={() => setIsPaymentHistoryModalOpen(false)}
        payments={paymentHistory?.payments ?? []}
      />
    </>
  );
};
