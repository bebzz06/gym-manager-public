import { useState } from 'react';
import { CloseIcon } from '@/components/Icons';
import { MemberSearchInput } from '@/components/Payments/MemberSearchInput';
import { SelectGroup } from '@/components/Forms';
import { UserRole } from '@shared/constants/user';
import { ConfirmDialog } from '@/common';
import toast from 'react-hot-toast';
import { updateMember } from '@/http/Member';
import { TUserRole } from '@shared/types/user.types';
import { selectOptions } from '@/constants/selectOptions';
interface ChangeRoleModalProps {
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
  onRoleChange: () => void;
}

interface IFormData {
  memberId: string;
  memberSearchTerm: string;
  role: string;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  popupOpen,
  setPopupOpen,
  onRoleChange,
}) => {
  const initialState: IFormData = {
    memberId: '',
    memberSearchTerm: '',
    role: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [roleToUpdate, setRoleToUpdate] = useState<TUserRole | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const resetForm = () => {
    setFormData(initialState);
    setError('');
    setRoleToUpdate('');
  };

  const handleClose = () => {
    resetForm();
    setPopupOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMemberSelect = (memberId: string, memberName: string, memberRole: TUserRole) => {
    setFormData(prev => ({
      ...prev,
      memberId,
      memberSearchTerm: memberName,
    }));
    setRoleToUpdate(memberRole);
  };
  const filteredRoleOptions = selectOptions.allowedRoleChanges.filter(
    role => role.value !== roleToUpdate
  );
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.memberId) {
      setError('Please select a member');
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmRoleChange = async () => {
    setLoading(true);
    setError('');

    try {
      await updateMember(formData.memberId, { role: formData.role as TUserRole });
      toast.success('Member role updated successfully');
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error updating member role');
      toast.error(error.response?.data?.message || 'Error updating member role');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      onRoleChange();
    }
  };
  const adminSearch = Object.values(UserRole).filter(role => role !== UserRole.OWNER);
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
                Change Member Role
              </h3>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-black transition hover:bg-white hover:text-primary dark:text-white"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-8 py-8">
            <form onSubmit={handleSubmit} className="text-left flex flex-col gap-4">
              {error && <div className="mb-4 text-danger text-red-500">{error}</div>}

              <MemberSearchInput
                label="Select Member"
                onChange={handleMemberSelect}
                error={error && !formData.memberId ? 'Please select a member' : undefined}
                value={formData.memberSearchTerm}
                searchRoleOptions={adminSearch}
              />

              <SelectGroup
                label="New Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                options={filteredRoleOptions}
                placeholder="Select role"
                containerWidth="sm:w-3/4"
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
                    {loading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmRoleChange}
        title="Confirm Role Change"
        message="Are you sure you want to change this member's role? This action may affect their permissions and access levels."
        confirmText="Update Role"
        cancelText="Cancel"
      />
    </>
  );
};
