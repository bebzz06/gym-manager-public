import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { FetchLoader } from '@/common';
import {
  MembershipPlansHeader,
  AddMembershipPlanModal,
  MembershipPlanCard,
} from '@/components/MembershipPlans';
import { getMembershipPlans } from '@/http/MembershipPlan';
import {
  fetchMembershipPlansStart,
  fetchMembershipPlansSuccess,
  fetchMembershipPlansFailure,
} from '@/store/slices/membershipPlansSlice';
import { UserRole, UserRoleAccess } from '@shared/constants/user';

const MembershipPlans = () => {
  const dispatch = useAppDispatch();
  const { plans, loading, error } = useAppSelector(state => state.membershipPlans);
  const { role } = useAppSelector(state => state.profile);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const hasAdminAccess = role ? UserRoleAccess[UserRole.ADMIN].includes(role) : false;

  useEffect(() => {
    const fetchPlans = async () => {
      dispatch(fetchMembershipPlansStart());
      try {
        const data = await getMembershipPlans();
        dispatch(fetchMembershipPlansSuccess(data));
      } catch (error: any) {
        dispatch(fetchMembershipPlansFailure(error.message));
        toast.error(error.message || 'Error fetching membership plans');
      }
    };

    fetchPlans();
  }, [dispatch]);

  return (
    <>
      <MembershipPlansHeader onAddClick={() => setIsAddModalOpen(true)} />
      <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-7.5">
        <div className="max-w-full">
          {loading ? (
            <FetchLoader />
          ) : error ? (
            <div className="rounded-sm border border-danger bg-danger bg-opacity-10 px-4 py-3 text-danger">
              {error}
            </div>
          ) : !plans.length ? (
            <div className="flex flex-col items-center justify-center py-10">
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-black dark:text-white">
                No Membership Plans Available
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {hasAdminAccess
                  ? 'Create your first membership plan to get started.'
                  : 'No membership plans are currently available for purchase.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
              {plans.map(plan => (
                <MembershipPlanCard key={plan.id} plan={plan} hasAdminAccess={hasAdminAccess} />
              ))}
            </div>
          )}
        </div>
      </div>
      <AddMembershipPlanModal popupOpen={isAddModalOpen} setPopupOpen={setIsAddModalOpen} />
    </>
  );
};

export default MembershipPlans;
