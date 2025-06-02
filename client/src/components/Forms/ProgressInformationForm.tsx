import { useState, useMemo, useEffect } from 'react';
import { selectOptions } from '@/constants';
import { SelectGroup, SelectOption } from '@/components/Forms';
import { ConfirmDialog } from '@/common/ConfirmDialog';
import isEqual from 'lodash/isEqual';
import { IProgressInformation } from '@/types/member.types';
import { TAgeCategory } from '@shared/types/user.types';
import { AgeCategory } from '@shared/constants/user';
import { getBeltOptions } from '@/utils';
interface ProgressInformationFormProps {
  initialData: IProgressInformation;
  onSubmit?: (data: IProgressInformation) => Promise<void>;
  onChange?: (data: IProgressInformation) => void;
  onCancel?: () => void;
  loading?: boolean;
  isControlled?: boolean;
  ageCategory?: TAgeCategory;
  editableFields?: string[];
}

export const ProgressInformationForm = ({
  initialData,
  onSubmit,
  onChange,
  onCancel,
  loading = false,
  isControlled = false,
  ageCategory = AgeCategory.ADULT,
  editableFields = [],
}: ProgressInformationFormProps) => {
  const [formData, setFormData] = useState(initialData);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const hasChanges = useMemo(() => {
    return !isEqual(formData, initialData);
  }, [formData, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isControlled) {
      // When controlled, call onSubmit if provided
      onSubmit?.(formData);
      return;
    }

    // When uncontrolled, onSubmit must exist
    if (!onSubmit) {
      console.error('onSubmit is required when form is not controlled');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    if (onCancel) onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newFormData: IProgressInformation;

    if (name.includes('rank')) {
      const rankField = name.split('.')[1] as 'belt' | 'stripes';
      newFormData = {
        ...formData,
        rank: {
          ...formData.rank,
          [rankField]: rankField === 'stripes' ? parseInt(value) || 0 : value,
        },
      };
    } else {
      newFormData = {
        ...formData,
        [name]: value,
      };
    }

    setFormData(newFormData);

    // Notify parent component of changes when in controlled mode
    if (isControlled && onChange) {
      onChange(newFormData);
    }
  };

  return (
    <div className="px-7 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <form onSubmit={handleSubmit}>
        <div className="border-b border-stroke py-4 dark:border-strokedark mb-5.5">
          <h3 className="font-medium text-black dark:text-white">Progress Information</h3>
        </div>
        <div className="flex flex-col gap-5.5 sm:flex-row">
          {/* <SelectGroup
            label="Membership Status"
            value={formData.membershipStatus}
            onChange={handleChange}
            options={selectOptions.membershipStatus}
            placeholder="Select status"
            name="membershipStatus"
            id="membershipStatus"
            disabled={!editableFields.includes('membershipStatus')}
          /> */}

          {/* <SelectGroup
            label="Membership Type"
            value={formData.membershipType}
            onChange={handleChange}
            options={selectOptions.membershipType}
            placeholder="Select type"
            name="membershipType"
            id="membershipType"
            disabled={!editableFields.includes('membershipType')}
          /> */}
        </div>
        <SelectOption
          label="Belt Rank"
          value={formData.rank?.belt}
          onChange={handleChange}
          options={getBeltOptions(ageCategory)}
          name="rank.belt"
          id="rank.belt"
          disabled={!editableFields.includes('rank')}
        />
        <SelectGroup
          label="Number of Stripes"
          value={formData.rank?.stripes.toString()}
          onChange={handleChange}
          options={selectOptions.stripes}
          placeholder="Select number of stripes"
          name="rank.stripes"
          id="rank.stripes"
          disabled={!editableFields.includes('rank')}
        />

        {/* Only show buttons when not controlled and onSubmit exists */}
        {!isControlled && onSubmit && hasChanges && (
          <div className="flex justify-center gap-4.5 mb-5.5">
            <button
              type="button"
              onClick={handleCancel}
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>

      {/* Only show confirm dialog when not controlled and onSubmit exists */}
      {!isControlled && onSubmit && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          title="Confirm Changes"
          message="Are you sure you want to save these changes?"
          confirmText="Save Changes"
        />
      )}
    </div>
  );
};
