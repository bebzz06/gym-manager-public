import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';
import { FetchLoader } from '@/common';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { CreditCardIcon, ViewIcon } from '@/components/Icons';
import {
  fetchPaymentTransactionsStart,
  fetchPaymentTransactionsSuccess,
  fetchPaymentTransactionsFailure,
  setPagination,
  setSorting,
} from '@/store/slices/paymentTransactionSlice';
import { PaymentsHeader } from '@/components/Payments/PaymentsHeader';
import toast from 'react-hot-toast';
import { getPaymentTransactions } from '@/http/PaymentTransaction';
import { confirmCashPayment } from '@/http/Payment';
import { formatAmount } from '@shared/utils';
import { formatDateForDisplay } from '@/utils/date';
import { SortHeader } from '@/common/SortHeader';
import { TValidSortField } from '@shared/types/sort.types';
import { SortOrder } from '@shared/constants/sort';
import { CreatePaymentModal } from '@/components/Payments/CreatePaymentModal';
import { PaymentStatus } from '@shared/constants/payment';
import { ConfirmDialog, Tooltip } from '@/common';
import { TooltipPosition } from '@/constants';
import { PaymentMethods } from '@shared/constants/payment';
import { formatToTitleCase } from '@/utils/string';
import { PaymentTransactionDetailsModal } from '@/components/Payments/PaymentTransactionDetailsModal';
import { IPaymentTransactionData } from '@shared/types/payment.types';

const DollarIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatMemberName = (firstName: string, lastName: string) => {
  return `${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`;
};

const Payments = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading, error, sorting, pagination } = useAppSelector(
    state => state.paymentTransactions
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<IPaymentTransactionData | null>(
    null
  );

  const handleSort = (field: TValidSortField) => {
    dispatch(
      setSorting({
        sortBy: field,
        sortOrder:
          sorting.sortBy === field && sorting.sortOrder === SortOrder.DESC
            ? SortOrder.ASC
            : SortOrder.DESC,
      })
    );
  };

  const fetchMoreTransactions = async () => {
    if (!pagination.hasMore || fetchingMore) return;

    setFetchingMore(true);
    try {
      const response = await getPaymentTransactions({
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
        cursor: pagination.cursor || undefined,
        limit: pagination.limit,
      });

      dispatch(fetchPaymentTransactionsSuccess([...transactions, ...response.data.transactions]));
      dispatch(
        setPagination({
          cursor: response.data.pagination.cursor,
          limit: response.data.pagination.limit,
          hasMore: response.data.pagination.hasMore,
        })
      );
    } catch (error: any) {
      toast.error('Failed to fetch more transactions');
    } finally {
      setFetchingMore(false);
    }
  };

  const handleViewPayment = (transaction: IPaymentTransactionData) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentId) return;

    dispatch(fetchPaymentTransactionsStart());
    try {
      await confirmCashPayment(selectedPaymentId);
      const response = await getPaymentTransactions({
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      });
      dispatch(fetchPaymentTransactionsSuccess(response.data.transactions));
      toast.success('Cash payment confirmed successfully');
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      dispatch(fetchPaymentTransactionsFailure(error.message));
      toast.error(error.message || 'Error confirming payment');
    } finally {
      setShowConfirmDialog(false);
      setSelectedPaymentId(null);
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      dispatch(fetchPaymentTransactionsStart());
      try {
        const response = await getPaymentTransactions({
          sortBy: sorting.sortBy,
          sortOrder: sorting.sortOrder,
        });
        dispatch(fetchPaymentTransactionsSuccess(response.data.transactions));
        dispatch(
          setPagination({
            cursor: response.data.pagination.cursor,
            limit: response.data.pagination.limit,
            hasMore: response.data.pagination.hasMore,
          })
        );
      } catch (error: any) {
        console.error('Error:', error);
        dispatch(fetchPaymentTransactionsFailure(error.message));
        toast.error('Failed to fetch transactions');
      }
    };

    fetchTransactions();
  }, [dispatch, sorting]);

  useEffect(() => {
    if (isAddModalOpen) return;
    const pendingPayments = transactions.filter(
      transaction => transaction.status === PaymentStatus.PENDING
    );

    if (pendingPayments.length > 0) {
      toast('You have pending cash payments that need confirmation', {
        id: 'pending-payments',
      });
    }
  }, [isAddModalOpen]);

  return (
    <>
      <PaymentsHeader onAddClick={() => setIsAddModalOpen(true)} />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto" style={{ height: '600px' }}>
          {loading && !transactions.length ? (
            <FetchLoader />
          ) : error ? (
            <div className="rounded-sm border border-danger bg-danger bg-opacity-10 px-4 py-3 text-danger">
              {error}
            </div>
          ) : !transactions?.length ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="flex items-center justify-center">
                <CreditCardIcon width="80" height="80" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-black dark:text-white">
                No Transactions Available
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                There are currently no transactions in the system.
              </p>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={transactions.length}
              next={fetchMoreTransactions}
              hasMore={pagination.hasMore}
              loader={<FetchLoader />}
              height={600}
            >
              <table className="w-full table-auto relative">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                      Payment By
                    </th>
                    <SortHeader
                      label="Date"
                      field="createdAt"
                      currentSort={sorting}
                      onSort={handleSort}
                    />

                    <SortHeader
                      label="Amount"
                      field="amount"
                      currentSort={sorting}
                      onSort={handleSort}
                    />
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Currency
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Status
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Payment Method
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td
                        className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11 cursor-pointer hover:bg-bodydark1 dark:hover:bg-primary transition"
                        onClick={() => handleViewPayment(transaction)}
                      >
                        <h5 className="font-medium text-black dark:text-white">
                          {formatMemberName(
                            transaction.paymentBy.firstName,
                            transaction.paymentBy.lastName
                          )}
                        </h5>
                        <p className="text-sm">{transaction.paymentBy.email}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        {formatDateForDisplay(transaction.createdAt)}
                      </td>

                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        {formatAmount(transaction.amount)}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        {transaction.currency}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        {formatToTitleCase(transaction.status)}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        {formatToTitleCase(transaction.paymentMethod)}
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          {transaction.status === PaymentStatus.PENDING &&
                            transaction.paymentMethod === PaymentMethods.CASH && (
                              <Tooltip
                                message="Confirm pending payment"
                                position={TooltipPosition.TOP}
                              >
                                <button
                                  className="hover:text-primary flex items-center"
                                  onClick={() => {
                                    setSelectedPaymentId(transaction.id);
                                    setShowConfirmDialog(true);
                                  }}
                                >
                                  <DollarIcon />
                                </button>
                              </Tooltip>
                            )}
                          <button
                            className="hover:text-primary flex items-center"
                            onClick={() => handleViewPayment(transaction)}
                          >
                            <ViewIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InfiniteScroll>
          )}
        </div>
      </div>
      <CreatePaymentModal popupOpen={isAddModalOpen} setPopupOpen={setIsAddModalOpen} />
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setSelectedPaymentId(null);
        }}
        onConfirm={handleConfirmPayment}
        title="Confirm Cash Payment"
        message="Are you sure you want to confirm this cash payment?"
        confirmText="Confirm Payment"
        cancelText="Cancel"
      />
      <PaymentTransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default Payments;
