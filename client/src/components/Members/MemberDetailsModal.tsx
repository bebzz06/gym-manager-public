import { CloseIcon } from '@/components/Icons';
import { useNavigate, generatePath } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { IMember } from '@/types/user.types';
import { formatToTitleCase } from '@/utils';
import { SubscriptionStatus } from '@shared/constants/subscription';
import { formatDateForDisplay } from '@/utils/date';
interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: IMember | undefined;
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
  };

  const handleEdit = async () => {
    if (member?.id) {
      try {
        onClose();
        const editPath = generatePath(ROUTES.DASHBOARD.EDIT_MEMBER, { id: member.id });
        navigate(editPath);
      } catch (error: any) {
        console.log(error);
      }
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5">
      <div className="relative w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-8 py-4 dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
              Member Details
            </h3>
            <button
              onClick={handleClose}
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
                Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Full Name
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {member.firstName} {member.lastName}
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Age
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">{member.age}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Membership Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Membership Status
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {member.membershipInfo?.status === SubscriptionStatus.ACTIVE
                      ? formatToTitleCase(member.membershipInfo.status)
                      : 'No valid membership. Click on details for more information.'}
                  </p>
                </div>
                {member.membershipInfo?.status === SubscriptionStatus.ACTIVE && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Valid Until
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {member.membershipInfo?.endDate
                        ? formatDateForDisplay(member.membershipInfo.endDate)
                        : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Rank Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Belt
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatToTitleCase(member.rank.belt)}
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Stripes
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">{member.rank.stripes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-8 py-4 dark:bg-boxdark">
          <div className="flex justify-center sm:justify-end gap-4.5">
            <button
              onClick={handleClose}
              className="flex justify-center items-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Close
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center rounded-md border border-primary py-2 px-6 text-center font-medium text-primary hover:bg-opacity-90"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
