import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { getMemberById, updateMember } from '@/http/Member';
import {
  fetchMemberStart,
  fetchMemberSuccess,
  fetchMemberFailure,
  updateMemberStart,
  updateMemberSuccess,
  updateMemberFailure,
} from '@/store/slices/memberDetailsSlice';
import { PersonalInformationForm } from '@/components/Forms/PersonalInformationForm';
import toast from 'react-hot-toast';
import { FetchLoader } from '@/common';
import { ProgressInformationForm } from '@/components/Forms/ProgressInformationForm';
import { IPersonalInformation, IProgressInformation } from '@/types/member.types';
import { ConfirmDialog } from '@/common/ConfirmDialog';
import isEqual from 'lodash/isEqual';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { MembershipInformation } from '@/components/Members';

const EditMember = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, member } = useAppSelector(state => state.memberDetails);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    personal?: IPersonalInformation;
    progress?: IProgressInformation;
  }>({});

  const [personalInformation, setPersonalInformation] = useState<IPersonalInformation>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    emergencyContact: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      relationship: undefined,
    },
  });
  const [progressInformation, setProgressInformation] = useState<IProgressInformation>({
    rank: { belt: '', stripes: '' },
  });

  const [editableFields, setEditableFields] = useState<string[]>([]);

  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      try {
        dispatch(fetchMemberStart());
        const response = await getMemberById(id);
        const memberData = response.member;
        console.log('Member Data:', memberData);
        dispatch(fetchMemberSuccess(memberData));
        setEditableFields(response.editableFields);
        setPersonalInformation({
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          email: memberData.email,
          phoneNumber: memberData.phoneNumber,
          dateOfBirth: memberData.dateOfBirth,
          emergencyContact: {
            firstName: memberData.emergencyContact?.firstName,
            lastName: memberData.emergencyContact?.lastName,
            email: memberData.emergencyContact?.email,
            phoneNumber: memberData.emergencyContact?.phoneNumber,
            relationship: memberData.emergencyContact?.relationship,
          },
        });
        setProgressInformation({
          rank: { belt: memberData.rank.belt, stripes: memberData.rank.stripes },
        });
      } catch (err: any) {
        dispatch(fetchMemberFailure(err.message || 'Error fetching member'));
        toast.error(err.message || 'Error fetching member');
      }
    };

    fetchMember();
  }, [id]);

  // Track if there are actual changes in either form
  const hasChanges = useMemo(() => {
    console.log('Pending Personal Changes:', pendingChanges.personal);

    const personalHasChanges = !isEqual(
      pendingChanges.personal || personalInformation,
      personalInformation
    );
    const progressHasChanges = !isEqual(
      pendingChanges.progress || progressInformation,
      progressInformation
    );

    return personalHasChanges || progressHasChanges;
  }, [pendingChanges, personalInformation, progressInformation]);

  useEffect(() => {
    if (hasChanges && buttonsRef.current) {
      buttonsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hasChanges]);

  const handlePersonalInfoChange = (data: IPersonalInformation) => {
    setPendingChanges(prev => ({ ...prev, personal: data }));
  };

  const handleProgressInfoChange = (data: IProgressInformation) => {
    setPendingChanges(prev => ({ ...prev, progress: data }));
  };

  // Add a cancel handler to reset both forms
  const handleCancelAll = () => {
    if (!member) return;

    setPendingChanges({});
    // Reset forms using data from Redux store
    setPersonalInformation({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phoneNumber: member.phoneNumber,
      dateOfBirth: member.dateOfBirth,
      emergencyContact: {
        firstName: member.emergencyContact?.firstName,
        lastName: member.emergencyContact?.lastName,
        email: member.emergencyContact?.email,
        phoneNumber: member.emergencyContact?.phoneNumber,
        relationship: member.emergencyContact?.relationship,
      },
    });
    setProgressInformation({
      rank: { belt: member.rank.belt, stripes: member.rank.stripes },
    });
  };

  const handleSubmitAll = async () => {
    if (!id) return;
    try {
      dispatch(updateMemberStart());

      // Create a properly structured update object
      const updatedData = {
        ...(pendingChanges.personal || personalInformation),
        rank: (pendingChanges.progress || progressInformation).rank,
      };

      const response = await updateMember(id, updatedData);
      dispatch(updateMemberSuccess(updatedData));

      // Update local state with the new values
      setPersonalInformation({
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: updatedData.email,
        phoneNumber: updatedData.phoneNumber,
        dateOfBirth: updatedData.dateOfBirth,
        emergencyContact: updatedData.emergencyContact,
      });

      setProgressInformation({
        rank: updatedData.rank,
      });

      // Clear pending changes
      setPendingChanges({});
      toast.success(response.message);
      navigate(ROUTES.DASHBOARD.MEMBERS);
      setShowConfirmDialog(false);
    } catch (err: any) {
      dispatch(updateMemberFailure(err.message || 'Error updating member'));
      toast.error(err.message || 'Error updating member');
      // Clear pending changes after error
      setPendingChanges({});
      setShowConfirmDialog(false);
    }
  };

  return (
    <div className="mx-auto flex flex-col items-center">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <FetchLoader />
        </div>
      ) : (
        <>
          <h2 className="mb-6 text-title-md2 font-semibold text-black dark:text-white">
            Edit Member
          </h2>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <div className="w-full sm:w-1/2">
              <MembershipInformation
                membershipInfo={member?.membershipInfo}
                paymentHistory={member?.paymentHistory}
              />
              <div className="mt-5">
                <ProgressInformationForm
                  initialData={progressInformation}
                  onChange={handleProgressInfoChange}
                  loading={loading}
                  isControlled={true}
                  ageCategory={member?.ageCategory}
                  editableFields={editableFields}
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2">
              <PersonalInformationForm
                initialData={personalInformation}
                onChange={handlePersonalInfoChange}
                loading={loading}
                isControlled={true}
                editableFields={editableFields}
              />
            </div>
          </div>

          <div ref={buttonsRef} className="flex justify-center gap-4 mt-8 mb-5">
            {hasChanges && (
              <>
                <button
                  onClick={handleCancelAll}
                  className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={loading}
                  className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save All Changes'}
                </button>
              </>
            )}
          </div>

          {/* Confirmation Dialog */}
          <ConfirmDialog
            isOpen={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={handleSubmitAll}
            title="Confirm Changes"
            message="Are you sure you want to save all changes to this member?"
            confirmText="Save Changes"
            cancelText="Cancel"
          />
        </>
      )}
    </div>
  );
};

export default EditMember;
