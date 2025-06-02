import { useState } from 'react';
import { CloseIcon } from '@/components/Icons';
import { createMembershipPlan, getMembershipPlans } from '@/http/MembershipPlan';
import { MembershipType } from '@shared/constants/user';
import { SubscriptionInterval } from '@shared/constants/subscription';
import { IMembershipPlanData } from '@/types/membership.plan.types';
import { TMembershipType } from '@shared/types/user.types';
import { TSubscriptionInterval } from '@shared/types/subscription.types';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useRef } from 'react';
import { fetchMembershipPlansSuccess } from '@/store/slices/membershipPlansSlice';
import { PaymentCurrencies, PaymentProcessors } from '@shared/constants/payment';
import { formatToTitleCase } from '@/utils/string';
import { TPaymentProcessor, TPaymentCurrency } from '@shared/types/payment.types';

interface AddMembershipPlanModalProps {
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
}

interface IFormData {
  name: string;
  description: string;
  category: TMembershipType | '';
  pricing: {
    amount: string;
    currency: TPaymentCurrency | '';
    interval: TSubscriptionInterval | '';
    intervalCount: string;
  };
  tax: {
    enabled: boolean;
    rate: string;
  };
  features: string[];
  trial: {
    enabled: boolean;
    days: string;
  };
  contractLength: string;
  maxMembers: string;
  paymentMethods: {
    cash: {
      enabled: boolean;
      instructions: string;
    };
    online: {
      enabled: boolean;
      processors: {
        [key: string]: {
          enabled: boolean;
          config: {
            [key: string]: string;
          };
        };
      };
    };
  };
}

// Define processor configuration requirements
const PROCESSOR_CONFIG_FIELDS = {
  pagueloFacil: [
    { key: 'cclw', label: 'CCLW', type: 'text' },
    { key: 'accessToken', label: 'Access Token API', type: 'password' },
    { key: 'key', label: 'Key', type: 'text' },
  ],
  // Add other processors as needed
} as const;

export const AddMembershipPlanModal: React.FC<AddMembershipPlanModalProps> = ({
  popupOpen,
  setPopupOpen,
}) => {
  const dispatch = useAppDispatch();
  const initialState: IFormData = {
    name: '',
    description: '',
    category: '',
    pricing: {
      amount: '',
      currency: PaymentCurrencies.USD,
      interval: '',
      intervalCount: '1',
    },
    tax: {
      enabled: false,
      rate: '0',
    },
    features: [''],
    trial: {
      enabled: false,
      days: '0',
    },
    contractLength: '0',
    maxMembers: '',
    paymentMethods: {
      cash: {
        enabled: false,
        instructions: '',
      },
      online: {
        enabled: true,
        processors: Object.values(PaymentProcessors).reduce(
          (acc, processor) => ({
            ...acc,
            [processor]: {
              enabled: false,
              config: PROCESSOR_CONFIG_FIELDS[processor].reduce(
                (fields, field) => ({
                  ...fields,
                  [field.key]: '',
                }),
                {}
              ),
            },
          }),
          {}
        ),
      },
    },
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const formContainerRef = useRef<HTMLDivElement>(null);

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

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorWithScroll('Plan name is required');
      return;
    }

    if (parseFloat(formData.pricing.amount) <= 0) {
      setErrorWithScroll('Price amount must be greater than 0');
      return;
    }

    if (formData.trial.enabled && parseInt(formData.trial.days) <= 0) {
      setErrorWithScroll('Trial days must be greater than 0 when trial is enabled');
      return;
    }

    if (!formData.paymentMethods.cash.enabled && !formData.paymentMethods.online.enabled) {
      setErrorWithScroll('At least one payment method must be enabled');
      return;
    }

    if (formData.paymentMethods.cash.enabled && !formData.paymentMethods.cash.instructions.trim()) {
      setErrorWithScroll('Cash payment instructions are required when cash payments are enabled');
      return;
    }

    // Validate payment processor configuration if online payments are enabled
    if (formData.paymentMethods.online.enabled) {
      const enabledProcessors = Object.entries(formData.paymentMethods.online.processors).filter(
        ([_, config]) => config.enabled
      );

      if (enabledProcessors.length === 0) {
        setErrorWithScroll('Please enable at least one payment processor for online payments');
        return;
      }

      // Validate that all required fields are filled for enabled processors
      const missingFields = enabledProcessors.reduce((errors: string[], [processorKey, config]) => {
        const requiredFields = PROCESSOR_CONFIG_FIELDS[processorKey as TPaymentProcessor];
        const emptyFields = requiredFields.filter(field => !config.config[field.key].trim());

        if (emptyFields.length > 0) {
          errors.push(`${processorKey}: ${emptyFields.map(f => f.label).join(', ')}`);
        }
        return errors;
      }, []);

      if (missingFields.length > 0) {
        setErrorWithScroll(`Missing required fields for: ${missingFields.join('; ')}`);
        return;
      }
    }

    if (
      formData.tax.enabled &&
      (parseFloat(formData.tax.rate) < 0 || parseFloat(formData.tax.rate) > 100)
    ) {
      setErrorWithScroll('Tax rate must be between 0 and 100');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const membershipPlanData: IMembershipPlanData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category as TMembershipType,
        pricing: {
          amount: Math.max(0, parseFloat(formData.pricing.amount) || 0),
          currency: formData.pricing.currency,
          interval: formData.pricing.interval as TSubscriptionInterval,
          intervalCount: Math.max(1, parseInt(formData.pricing.intervalCount) || 1),
          tax: {
            enabled: formData.tax.enabled,
            rate: formData.tax.enabled ? parseFloat(formData.tax.rate) / 100 : 0, // Convert percentage to decimal
          },
        },

        features: formData.features.filter(f => f.trim() !== ''),
        trial: {
          enabled: formData.trial.enabled,
          days: Math.max(0, parseInt(formData.trial.days) || 0),
        },
        contractLength: Math.max(0, parseInt(formData.contractLength) || 0),
        maxMembers: formData.maxMembers ? Math.max(0, parseInt(formData.maxMembers)) : null,
        paymentMethodSettings: {
          ...(formData.paymentMethods.cash.enabled && {
            cash: {
              enabled: true,
              instructions: formData.paymentMethods.cash.instructions.trim(),
            },
          }),
          ...Object.entries(formData.paymentMethods.online.processors)
            .filter(([_, config]) => config.enabled)
            .reduce(
              (acc, [processorKey, config]) => ({
                ...acc,
                [processorKey]: {
                  enabled: true,
                  credentials: config.config,
                },
              }),
              {}
            ),
        },
      };

      const response = await createMembershipPlan(membershipPlanData);
      console.log(response);

      const data = await getMembershipPlans();
      dispatch(fetchMembershipPlansSuccess(data));

      setPopupOpen(false);
      toast.success('Membership plan created successfully');
      resetForm();
    } catch (error: any) {
      console.error('Membership plan creation error:', error);
      setErrorWithScroll(
        error.response?.data?.message || error.message || 'Error creating membership plan'
      );
      toast.error(error.message || 'Error creating membership plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        popupOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="relative w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark">
        <div className="sticky top-0 z-10 bg-white px-8 py-4 dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
              Add New Membership Plan
            </h3>
            <button
              onClick={handleClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-black transition hover:bg-white hover:text-primary dark:text-white"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div ref={formContainerRef} className="max-h-[calc(100vh-200px)] overflow-y-auto px-8 py-8">
          <form onSubmit={handleSubmit} className="text-left">
            {error && <div className="mb-4 text-danger text-red-500">{error}</div>}

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Plan Name
              </label>
              <input
                type="text"
                placeholder="Enter plan name"
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Description
              </label>
              <textarea
                placeholder="Enter plan description"
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Category
              </label>
              <select
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value as TMembershipType })
                }
              >
                <option value="">Select category</option>
                {Object.values(MembershipType)
                  .filter(type => type !== MembershipType.NONE)
                  .map(type => (
                    <option key={type} value={type}>
                      {formatToTitleCase(type)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Price Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter price amount"
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  value={formData.pricing.amount}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, amount: e.target.value },
                    })
                  }
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Billing Interval
                </label>
                <select
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  value={formData.pricing.interval}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      pricing: {
                        ...formData.pricing,
                        interval: e.target.value as TSubscriptionInterval,
                      },
                    })
                  }
                >
                  <option value="">Select interval</option>
                  {Object.values(SubscriptionInterval).map(interval => (
                    <option key={interval} value={interval}>
                      {formatToTitleCase(interval)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Tax Settings
              </label>
              <div className="flex items-center gap-4 mb-3">
                <input
                  type="checkbox"
                  checked={formData.tax.enabled}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      tax: { ...formData.tax, enabled: e.target.checked },
                    })
                  }
                  className="form-checkbox"
                />
                <span>Enable tax for this plan</span>
              </div>
              {formData.tax.enabled && (
                <>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter tax rate percentage"
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    value={formData.tax.rate}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        tax: { ...formData.tax, rate: e.target.value },
                      })
                    }
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    The tax amount will be calculated automatically based on this rate.
                  </p>
                </>
              )}
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Features
              </label>
              {formData.features.map((feature, index) => (
                <div key={index} className="mb-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter feature"
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    value={feature}
                    onChange={e => handleFeatureChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="flex items-center justify-center rounded bg-danger px-4 text-white hover:bg-opacity-90"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90"
              >
                Add Feature
              </button>
            </div>
            {/* TODO: Remove this once we have a handling of trial periods */}
            <div hidden={true} className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Trial Period
              </label>
              <div className="flex items-center gap-4 mb-3">
                <input
                  type="checkbox"
                  checked={formData.trial.enabled}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      trial: { ...formData.trial, enabled: e.target.checked },
                    })
                  }
                  className="form-checkbox"
                />
                <span>Enable trial period</span>
              </div>
              {formData.trial.enabled && (
                <>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    How many days?
                  </label>
                  <input
                    type="number"
                    placeholder="Enter trial days"
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    value={formData.trial.days}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        trial: { ...formData.trial, days: e.target.value },
                      })
                    }
                  />
                </>
              )}
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Payment Methods
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.online.enabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        paymentMethods: {
                          ...formData.paymentMethods,
                          online: {
                            ...formData.paymentMethods.online,
                            enabled: e.target.checked,
                          },
                        },
                      })
                    }
                    className="form-checkbox"
                  />
                  <span>Enable online payments</span>
                </div>

                {formData.paymentMethods.online.enabled && (
                  <div className="mt-3 space-y-4">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Configure Payment Processors
                    </label>

                    {Object.entries(PaymentProcessors).map(([key, processorKey]) => (
                      <div
                        key={processorKey}
                        className="rounded border border-stroke p-4 dark:border-strokedark"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <input
                            type="checkbox"
                            checked={
                              formData.paymentMethods.online.processors[processorKey].enabled
                            }
                            onChange={e => {
                              setFormData({
                                ...formData,
                                paymentMethods: {
                                  ...formData.paymentMethods,
                                  online: {
                                    ...formData.paymentMethods.online,
                                    processors: {
                                      ...formData.paymentMethods.online.processors,
                                      [processorKey]: {
                                        ...formData.paymentMethods.online.processors[processorKey],
                                        enabled: e.target.checked,
                                      },
                                    },
                                  },
                                },
                              });
                            }}
                            className="form-checkbox"
                          />
                          <span className="font-medium">{formatToTitleCase(key)}</span>
                        </div>

                        {formData.paymentMethods.online.processors[processorKey].enabled && (
                          <div className="space-y-3 pl-8">
                            {PROCESSOR_CONFIG_FIELDS[processorKey as TPaymentProcessor].map(
                              field => (
                                <div key={field.key}>
                                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                    {field.label}
                                  </label>
                                  <input
                                    type={field.type}
                                    value={
                                      formData.paymentMethods.online.processors[processorKey]
                                        .config[field.key]
                                    }
                                    onChange={e => {
                                      setFormData({
                                        ...formData,
                                        paymentMethods: {
                                          ...formData.paymentMethods,
                                          online: {
                                            ...formData.paymentMethods.online,
                                            processors: {
                                              ...formData.paymentMethods.online.processors,
                                              [processorKey]: {
                                                ...formData.paymentMethods.online.processors[
                                                  processorKey
                                                ],
                                                config: {
                                                  ...formData.paymentMethods.online.processors[
                                                    processorKey
                                                  ].config,
                                                  [field.key]: e.target.value,
                                                },
                                              },
                                            },
                                          },
                                        },
                                      });
                                    }}
                                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.cash.enabled}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        paymentMethods: {
                          ...formData.paymentMethods,
                          cash: { ...formData.paymentMethods.cash, enabled: e.target.checked },
                        },
                      })
                    }
                    className="form-checkbox"
                  />
                  <span>Enable cash payments</span>
                </div>
                {formData.paymentMethods.cash.enabled && (
                  <textarea
                    placeholder="Enter cash payment instructions"
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    value={formData.paymentMethods.cash.instructions}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        paymentMethods: {
                          ...formData.paymentMethods,
                          cash: { ...formData.paymentMethods.cash, instructions: e.target.value },
                        },
                      })
                    }
                    rows={2}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4.5">
              <button
                type="button"
                onClick={handleClose}
                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90"
              >
                {loading ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
