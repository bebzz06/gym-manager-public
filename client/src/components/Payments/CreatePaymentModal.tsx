import { useState, useRef, useEffect } from 'react';
import { CloseIcon } from '@/components/Icons';
import { PaymentMethods } from '@shared/constants/payment';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { createCashPayment, getPagueloFacilPaymentLink, confirmCashPayment } from '@/http/Payment';
import { getPaymentTransactions } from '@/http/PaymentTransaction';
import {
  fetchPaymentTransactionsFailure,
  fetchPaymentTransactionsStart,
  fetchPaymentTransactionsSuccess,
} from '@/store/slices/paymentTransactionSlice';
import { SelectGroup } from '@/components/Forms';
import { selectOptions } from '@/constants';
import { MemberSearchInput } from '@/components/Payments/MemberSearchInput';
import { PaymentTransactionTypes } from '@shared/constants/payment';
import {
  fetchMembershipPlansStart,
  fetchMembershipPlansSuccess,
  fetchMembershipPlansFailure,
} from '@/store/slices/membershipPlansSlice';
import { getMembershipPlans } from '@/http/MembershipPlan';
import { IMembershipPlanData } from '@/types/membership.plan.types';
import { TPaymentTransactionType } from '@shared/types/payment.types';
import { ConfirmDialog } from '@/common';
import { AxiosError } from 'axios';
import { UserRole } from '@shared/constants/user';
interface CreatePaymentModalProps {
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
}

interface IFormData {
  purchasedItemType: string;
  purchasedItemId: string;
  paymentBy: string;
  paymentMethod: string;
  notes: string;
  memberSearchTerm: string;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  popupOpen,
  setPopupOpen,
}) => {
  const dispatch = useAppDispatch();
  const { plans, loading: plansLoading } = useAppSelector(state => state.membershipPlans);
  const initialState: IFormData = {
    purchasedItemType: '',
    purchasedItemId: '',
    paymentBy: '',
    paymentMethod: '',
    notes: '',
    memberSearchTerm: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const setErrorWithScroll = (errorMessage: string) => {
    setError(errorMessage);
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    setPopupOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberSelect = (memberId: string, memberName: string) => {
    setFormData(prev => ({
      ...prev,
      paymentBy: memberId,
      memberSearchTerm: memberName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.purchasedItemId || !formData.purchasedItemType) {
      setErrorWithScroll('Please select an item to purchase');
      return;
    }

    if (!formData.paymentBy) {
      setErrorWithScroll('Please select a member');
      return;
    }

    if (!formData.paymentMethod) {
      setErrorWithScroll('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (formData.paymentMethod === PaymentMethods.CASH) {
        const response = await createCashPayment({
          purchasedItemId: formData.purchasedItemId,
          purchasedItemType: formData.purchasedItemType as TPaymentTransactionType,
          paymentBy: formData.paymentBy,
          notes: formData.notes || '',
        });

        if (response.success && response.data) {
          setPendingPaymentId(response.data._id);
          setShowConfirmDialog(true);
        } else {
          throw new Error('Invalid payment response');
        }
        setLoading(false);
      } else if (formData.paymentMethod === PaymentMethods.PAGUELO_FACIL) {
        const response = await getPagueloFacilPaymentLink({
          purchasedItemId: formData.purchasedItemId,
          purchasedItemType: formData.purchasedItemType as TPaymentTransactionType,
          paymentBy: formData.paymentBy,
        });

        if (response?.success && response?.data?.paymentUrl) {
          // Open payment link in new tab
          window.open(response.data.paymentUrl, '_blank');

          setPopupOpen(false);
          toast.success('Payment link generated successfully');
          resetForm();
        } else {
          throw new Error('Invalid payment response');
        }
      }
    } catch (error: any) {
      console.error('Payment creation error:', error);
      setErrorWithScroll(
        error.response?.data?.message || error.message || 'Error creating payment'
      );
      toast.error(
        error instanceof AxiosError ? error.response?.data?.message : 'Error creating payment'
      );
      setLoading(false);
    }
  };

  const handleCloseConfirmDialog = async () => {
    dispatch(fetchPaymentTransactionsStart());
    try {
      const response = await getPaymentTransactions({});
      dispatch(fetchPaymentTransactionsSuccess(response.data.transactions));
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      toast.error(
        error instanceof AxiosError ? error.response?.data?.message : 'Error confirming payment'
      );
      dispatch(fetchPaymentTransactionsFailure(error.message));
    } finally {
      setShowConfirmDialog(false);
      setPopupOpen(false);
      resetForm();
    }
  };

  const handleConfirmPayment = async () => {
    if (!pendingPaymentId) return;
    dispatch(fetchPaymentTransactionsStart());
    try {
      await confirmCashPayment(pendingPaymentId);
      const response = await getPaymentTransactions({});
      dispatch(fetchPaymentTransactionsSuccess(response.data.transactions));
      toast.success('Cash payment confirmed successfully');
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      dispatch(fetchPaymentTransactionsFailure(error.message));
      toast.error(
        error instanceof AxiosError ? error.response?.data?.message : 'Error confirming payment'
      );
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      if (formData.purchasedItemType === PaymentTransactionTypes.MEMBERSHIP_PLAN) {
        dispatch(fetchMembershipPlansStart());
        try {
          const data = await getMembershipPlans();
          console.log('Fetched membership plans:', data);
          dispatch(fetchMembershipPlansSuccess(data));
        } catch (error: any) {
          dispatch(fetchMembershipPlansFailure(error.message));
          toast.error(
            error instanceof AxiosError
              ? error.response?.data?.message
              : 'Error fetching membership plans'
          );
        }
      }
    };

    fetchPlans();
  }, [formData.purchasedItemType, dispatch]);

  // Transform membership plans into select options when type is selected
  const membershipPlanOptions =
    formData.purchasedItemType === PaymentTransactionTypes.MEMBERSHIP_PLAN
      ? plans
          .filter(plan => plan.isActive)
          .map(plan => ({
            value: plan.id,
            label: plan.name,
          }))
      : [];

  const selectedPlan = formData.purchasedItemId
    ? plans.find(plan => plan.id === formData.purchasedItemId)
    : null;

  // Add this helper function to transform payment methods into select options
  const getPaymentMethodOptions = (plan: IMembershipPlanData) => {
    return Object.entries(plan.paymentMethodSettings)
      .filter(([_, settings]) => (settings as { enabled: boolean }).enabled)
      .map(([method]) => ({
        value: method,
        label: method === PaymentMethods.PAGUELO_FACIL ? 'Paguelo Facil' : 'Cash',
      }));
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
          popupOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="relative w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark">
          <div className="sticky top-0 z-10 bg-white px-8 py-4 dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
                Create New Payment
              </h3>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-black transition hover:bg-white hover:text-primary dark:text-white"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div
            ref={formContainerRef}
            className="max-h-[calc(100vh-200px)] overflow-y-auto px-8 py-8"
          >
            <form onSubmit={handleSubmit} className="text-left">
              {error && <div className="mb-4 text-danger text-red-500">{error}</div>}

              <SelectGroup
                label="Item Type"
                name="purchasedItemType"
                value={formData.purchasedItemType}
                onChange={handleChange}
                options={selectOptions.paymentTransactionTypes}
                placeholder="Select item type"
                containerWidth="sm:w-3/4"
              />

              {formData.purchasedItemType === PaymentTransactionTypes.MEMBERSHIP_PLAN && (
                <>
                  <SelectGroup
                    label="Membership Plan"
                    name="purchasedItemId"
                    value={formData.purchasedItemId}
                    onChange={handleChange}
                    options={membershipPlanOptions}
                    placeholder={plansLoading ? 'Loading plans...' : 'Select plan'}
                    disabled={plansLoading}
                    containerWidth="sm:w-3/4"
                  />

                  {selectedPlan && (
                    <div className="mb-5.5 rounded-sm border border-stroke bg-gray-100 p-4 dark:border-strokedark dark:bg-meta-4">
                      <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                        Plan Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-black dark:text-white">Description:</span>
                          <span className="text-right text-gray-600 dark:text-gray-400">
                            {selectedPlan.description || 'No description available'}
                          </span>
                        </div>
                        {selectedPlan?.features && selectedPlan.features.length > 0 && (
                          <div className="mt-3">
                            <span className="text-black dark:text-white">Features:</span>
                            <ul className="mt-1 list-inside list-disc text-gray-600 dark:text-gray-400">
                              {selectedPlan.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-black dark:text-white">Amount:</span>
                          <span className="text-right font-medium text-black dark:text-white">
                            ${selectedPlan.pricing.amount} {selectedPlan.pricing.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-black dark:text-white">Billing:</span>
                          <span className="text-right text-gray-600 dark:text-gray-400">
                            Every {selectedPlan.pricing.intervalCount}{' '}
                            {selectedPlan.pricing.interval}
                          </span>
                        </div>
                        {selectedPlan.pricing.tax.enabled && (
                          <div className="flex justify-between">
                            <span className="text-black dark:text-white">Tax Rate:</span>
                            <span className="text-right text-gray-600 dark:text-gray-400">
                              {(selectedPlan.pricing.tax.rate * 100).toFixed(2)}%
                            </span>
                          </div>
                        )}
                        <SelectGroup
                          label="Payment Method"
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          options={getPaymentMethodOptions(selectedPlan)}
                          placeholder="Select payment method"
                        />
                        {formData.paymentMethod === PaymentMethods.CASH && (
                          <>
                            {selectedPlan?.paymentMethodSettings?.[PaymentMethods.CASH]?.enabled &&
                              selectedPlan?.paymentMethodSettings?.[PaymentMethods.CASH]
                                ?.instructions && (
                                <div className="mt-2 rounded-sm p-4 dark:border-strokedark dark:bg-meta-4">
                                  <h5 className="mb-1 text-sm font-medium text-black dark:text-white">
                                    Cash Payment Instructions:
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {
                                      selectedPlan?.paymentMethodSettings?.[PaymentMethods.CASH]
                                        ?.instructions
                                    }
                                  </p>
                                </div>
                              )}
                            <div className="mt-2">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Payment Notes
                              </label>
                              <textarea
                                name="notes"
                                placeholder="Enter payment notes"
                                className="w-full rounded border border-stroke bg-transparent py-3 px-4.5 text-black focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary resize-none outline-none"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <MemberSearchInput
                label="Payment By"
                onChange={handleMemberSelect}
                error={error && !formData.paymentBy ? 'Please select a member' : undefined}
                value={formData.memberSearchTerm}
                searchRoleOptions={[UserRole.MEMBER]}
              />
              <div className="bg-white px-8 py-4 dark:bg-boxdark">
                <div className="flex justify-end gap-4.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex justify-center items-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex justify-center items-center rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Payment'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmPayment}
        title="Confirm Cash Payment"
        message="Please confirm that you have received the cash payment from the member."
        confirmText="Confirm Payment"
        cancelText="Cancel"
      />
    </>
  );
};
