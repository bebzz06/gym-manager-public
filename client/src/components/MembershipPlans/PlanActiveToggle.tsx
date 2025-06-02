import { useState } from 'react';
import { getMembershipPlans, toggleMembershipPlanStatus } from '@/http/MembershipPlan';
import { ConfirmDialog } from '@/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { fetchMembershipPlansSuccess } from '@/store/slices/membershipPlansSlice';
import { useAppDispatch } from '@/hooks/useAppDispatch';

interface PlanActiveToggleProps {
  isActive: boolean;
  planId: string;
}

export const PlanActiveToggle = ({ isActive, planId }: PlanActiveToggleProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const dispatch = useAppDispatch();
  const handleToggle = async () => {
    try {
      const response = await toggleMembershipPlanStatus(planId);
      const data = await getMembershipPlans();
      dispatch(fetchMembershipPlansSuccess(data));
      toast.success(response.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="mt-9 flex items-center justify-center">
        <label
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            isActive ? 'bg-primary' : 'bg-stroke dark:bg-strokedark'
          }`}
        >
          <input
            type="checkbox"
            className="peer sr-only"
            checked={isActive}
            onChange={() => setShowConfirm(true)}
          />
          <span className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all peer-checked:translate-x-full" />
        </label>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleToggle}
        title={`${isActive ? 'Deactivate' : 'Activate'} Membership Plan`}
        message={`Are you sure you want to ${
          isActive ? 'deactivate' : 'activate'
        } this membership plan?`}
        confirmText={isActive ? 'Deactivate' : 'Activate'}
      />
    </>
  );
};
