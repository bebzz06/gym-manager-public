import { formatCurrency } from '@/utils';
import { SubscriptionInterval } from '@shared/constants/subscription';
import { IMembershipPlan } from '@/types/store.types';
import { PlanActiveToggle } from './PlanActiveToggle';
import { PagueloFacilButton } from './PagueloFacilButton';

interface MembershipPlanCardProps {
  plan: IMembershipPlan;
  hasAdminAccess: boolean;
}

const formatInterval = (interval: string, count: number) => {
  const intervalMap = {
    [SubscriptionInterval.MINUTE]: 'minute',
    [SubscriptionInterval.DAY]: 'day',
    [SubscriptionInterval.WEEK]: 'week',
    [SubscriptionInterval.MONTH]: 'month',
    [SubscriptionInterval.YEAR]: 'year',
  };
  const unit = intervalMap[interval as keyof typeof SubscriptionInterval] || interval.toLowerCase();
  return `${count > 1 ? count : ''} ${unit}${count > 1 ? 's' : ''}`;
};

export const MembershipPlanCard = ({ plan, hasAdminAccess }: MembershipPlanCardProps) => {
  return (
    <div className="relative rounded-lg border border-stroke bg-transparent p-6 shadow-default dark:border-strokedark md:p-9 xl:p-11.5 flex flex-col items-center justify-center min-h-full">
      {hasAdminAccess && plan.isActive && (
        <span className="absolute top-3.5 -right-1">
          <svg width={109} height={34} viewBox="0 0 109 34" fill="none">
            <path d="M24 0L106 0C107.657 0 109 1.34315 109 3V30L24 30L24 0Z" fill="#3C50E0" />
            <foreignObject x={24} y={0} width={81} height={30}>
              <div className="mt-1 text-center font-satoshi text-sm font-medium text-white">
                Active
              </div>
            </foreignObject>
            <path d="M0 0H24V30H0L19 15L0 0Z" fill="#3C50E0" />
            <path d="M105 34L109 30H105V34Z" fill="#2539C8" />
          </svg>
        </span>
      )}
      <div className="flex flex-col items-center justify-center text-center">
        <span className="mb-2.5 block text-title-sm2 font-bold text-black dark:text-white">
          {plan.name}
        </span>
        <h3>
          <span className="text-xl font-medium text-black dark:text-white">
            {plan.pricing.currency}
          </span>
          <span className="text-title-xxl2 font-bold text-black dark:text-white">
            {formatCurrency(plan.pricing.amount)}
          </span>
          <span className="font-medium">
            {' '}
            / {formatInterval(plan.pricing.interval, plan.pricing.intervalCount)}
          </span>
        </h3>

        {plan.features && plan.features.length > 0 && (
          <>
            <h4 className="mt-7.5 mb-5 text-lg font-medium text-black dark:text-white">
              What's included
            </h4>

            <ul className="flex flex-col gap-3.5 items-center">
              {plan.features.map((feature, index) => (
                <li key={index} className="font-medium">
                  {feature}
                </li>
              ))}
            </ul>
          </>
        )}

        {hasAdminAccess && <PlanActiveToggle isActive={plan.isActive} planId={plan.id} />}

        <div className="flex flex-col items-center justify-center gap-4 p-6">
          {!hasAdminAccess &&
            (plan.paymentMethodSettings?.pagueloFacil || plan.paymentMethodSettings?.cash) && (
              <div className="text-center">
                <h5 className="text-gray-700 mb-2">Payment Options:</h5>
                {plan.paymentMethodSettings?.pagueloFacil && (
                  <PagueloFacilButton itemId={plan.id} itemType={plan.itemType} />
                )}
                {plan.paymentMethodSettings?.cash && (
                  <div className="mt-3 flex flex-col items-center justify-center">
                    <svg
                      className="h-20 w-20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M6 12h.01M18 12h.01" />
                      <path d="M2 10h20M2 14h20" />
                    </svg>
                    <p className="text-xs">Cash payments are available</p>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
