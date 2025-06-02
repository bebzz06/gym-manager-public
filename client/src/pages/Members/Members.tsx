import { useEffect, useState } from 'react';
import { getMembers, deleteMember } from '@/http/Member';
import { sendMemberSetupEmail } from '@/http/Auth';
import {
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
} from '@/store/slices/membersSlice';
import { MembersHeader, MemberDetailsModal, AddMemberModal } from '@/components/Members';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { IMember } from '@/types/user.types';
import { ConfirmDialog, FetchLoader } from '@/common';
import toast from 'react-hot-toast';
import { DeleteIcon, ViewIcon, EmailIcon } from '@/components/Icons';
import { Tooltip } from '@/common/Tooltip';
import { TooltipPosition } from '@/constants';
import { getBeltImage } from '@/utils';
import { formatBeltRank } from '@/utils';
import { SubscriptionStatus } from '@shared/constants/subscription';
const Members = () => {
  const dispatch = useAppDispatch();
  const { members, loading, error } = useAppSelector(state => state.members);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<IMember | null>(null);
  const [isMemberSetupModalOpen, setIsMemberSetupModalOpen] = useState(false);
  const [memberToSetup, setMemberToSetup] = useState<IMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      dispatch(fetchMembersStart());
      try {
        const data = await getMembers();
        dispatch(fetchMembersSuccess(data));
      } catch (error: any) {
        dispatch(fetchMembersFailure(error.message));
      }
    };

    fetchMembers();
  }, [dispatch]);

  const handleViewMember = (member: IMember) => {
    setSelectedMemberId(member.id);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (member: IMember) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    dispatch(fetchMembersStart());
    try {
      await deleteMember(memberToDelete.id);
      const data = await getMembers();
      dispatch(fetchMembersSuccess(data));
      toast.success('Member deleted successfully');
    } catch (error: any) {
      dispatch(fetchMembersFailure(error.message));
      toast.error('Failed to delete member');
      console.error('Delete member error:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleResendVerificationClick = (member: IMember) => {
    setMemberToSetup(member);
    setIsMemberSetupModalOpen(true);
  };

  const handleConfirmMemberSetup = async () => {
    if (!memberToSetup) return;

    try {
      await sendMemberSetupEmail(memberToSetup.email);
      toast.success('Member setup email has been sent');
    } catch (error: any) {
      if (error.isRateLimit) {
        toast.error(error.response?.data?.message || 'Too many attempts. Please try again later.');
      } else {
        toast.error('Failed to send member setup email');
        console.error('Sending member setup email error:', error);
      }
    } finally {
      setIsMemberSetupModalOpen(false);
      setMemberToSetup(null);
    }
  };

  return (
    <>
      <MembersHeader onAddClick={() => setIsAddModalOpen(true)} />
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          {loading ? (
            <FetchLoader />
          ) : error ? (
            <div className="rounded-sm border border-danger bg-danger bg-opacity-10 px-4 py-3 text-danger">
              {error}
            </div>
          ) : !members.length ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-black dark:text-white">
                No Members Available
              </h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                There are currently no members in the system.
              </p>
            </div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Name
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Valid Membership
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Rank
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr
                    className={`${!member.isEmailVerified ? 'bg-warning/30' : ''}`}
                    key={member.id}
                  >
                    <td
                      className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11 cursor-pointer hover:bg-bodydark1 dark:hover:bg-primary transition"
                      onClick={() => handleViewMember(member)}
                    >
                      <h5 className="font-medium text-black dark:text-white">
                        {member.firstName} {member.lastName}
                      </h5>
                      <p className="text-sm">{member.email}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {member.membershipInfo?.status === SubscriptionStatus.ACTIVE ? 'Yes' : 'No'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <img
                        src={getBeltImage(member.rank.belt, member.rank.stripes)}
                        alt={formatBeltRank(member.rank.belt, member.rank.stripes)}
                        className="w-14 h-14"
                      />
                    </td>

                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center space-x-3.5">
                        <button
                          className="hover:text-primary flex items-center"
                          onClick={() => handleViewMember(member)}
                        >
                          <ViewIcon />
                        </button>
                        {!member.isEmailVerified && (
                          <Tooltip message="Send verification email" position={TooltipPosition.TOP}>
                            <button
                              className="hover:text-primary flex items-center"
                              onClick={() => handleResendVerificationClick(member)}
                            >
                              <EmailIcon width="18" height="18" />
                            </button>
                          </Tooltip>
                        )}
                        <button
                          className="hover:text-primary flex items-center"
                          onClick={() => handleDeleteClick(member)}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <MemberDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        member={members.find(m => m.id === selectedMemberId)}
      />
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${memberToDelete?.firstName} ${memberToDelete?.lastName}?`}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ConfirmDialog
        isOpen={isMemberSetupModalOpen}
        onClose={() => setIsMemberSetupModalOpen(false)}
        onConfirm={handleConfirmMemberSetup}
        title="Send Member Setup Email"
        message={`Are you sure you want to send a member setup email to ${memberToSetup?.firstName} ${memberToSetup?.lastName}?`}
        confirmText="Send"
        cancelText="Cancel"
      />
      <AddMemberModal popupOpen={isAddModalOpen} setPopupOpen={setIsAddModalOpen} />
    </>
  );
};

export default Members;
