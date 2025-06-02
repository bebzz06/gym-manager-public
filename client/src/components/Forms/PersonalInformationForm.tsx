import { useState, useEffect, useMemo } from 'react';
import { IProfileData } from '@/types/profile.types';
import { ConfirmDialog } from '@/common/ConfirmDialog';
import isEqual from 'lodash/isEqual';
import { formatDateForInput } from '@/utils';
import { SelectGroup, InputText, InputPhoneNumber } from '@/components/Forms';
import { selectOptions } from '@/constants/selectOptions';

interface PersonalInformationFormProps {
  initialData: IProfileData;
  onSubmit?: (data: IProfileData) => Promise<void>;
  onChange?: (data: IProfileData) => void;
  onCancel?: () => void;
  loading?: boolean;

  isControlled?: boolean;
  editableFields?: string[] | null;
}

export const PersonalInformationForm = ({
  initialData,
  onSubmit,
  onChange,
  onCancel,
  loading = false,
  isControlled = false,
  editableFields = null,
}: PersonalInformationFormProps) => {
  const [formData, setFormData] = useState(initialData);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const hasChanges = useMemo(() => {
    return !isEqual(formData, initialData);
  }, [formData, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | string,
    field?: string
  ) => {
    // Handle PhoneInput changes
    if (typeof e === 'string') {
      let newFormData;
      if (field === 'emergency') {
        newFormData = {
          ...formData,
          emergencyContact: {
            ...formData.emergencyContact,
            phoneNumber: e,
          },
        };
      } else {
        newFormData = {
          ...formData,
          phoneNumber: e,
        };
      }

      setFormData(newFormData);

      // Add this: Notify parent component of changes when in controlled mode
      if (isControlled && onChange) {
        onChange(newFormData);
      }
      return;
    }

    // Handle regular input changes
    const { name, value } = e.target;
    let newFormData;

    if (name.includes('emergency')) {
      const field = name.split('.')[1];
      newFormData = {
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [field]: value,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isControlled) {
      // When controlled, call onSubmit if provided
      onSubmit?.(formData);
      return;
    }

    // When uncontrolled (Profile page), onSubmit must exist
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

  // New function to handle form reset
  const handleCancel = () => {
    // Reset form data to initial state
    setFormData(initialData);

    // Still call the onCancel prop in case parent components need to do something
    if (onCancel) onCancel();
  };

  // In the form, check if editableFields is null (meaning all fields editable)
  const isFieldEditable = (fieldName: string) => {
    if (editableFields === null) return true; // All fields editable
    return editableFields.includes(fieldName); // Check permissions
  };

  return (
    <div className="px-7 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <form onSubmit={handleSubmit}>
        <div className="border-b border-stroke py-4 dark:border-strokedark mb-5.5">
          <h3 className="font-medium text-black dark:text-white">Personal Information</h3>
        </div>

        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputText
            label="First Name"
            name="firstName"
            value={formData.firstName ?? ''}
            onChange={handleChange}
            placeholder="Enter first name"
            disabled={!isFieldEditable('firstName')}
          />

          <InputText
            label="Last Name"
            name="lastName"
            value={formData.lastName ?? ''}
            onChange={handleChange}
            placeholder="Enter last name"
            disabled={!isFieldEditable('lastName')}
          />
        </div>

        <div className="mb-5.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Date of Birth
          </label>
          <div className="relative">
            <input
              type="date"
              name="dateOfBirth"
              value={formatDateForInput(formData.dateOfBirth ?? '')}
              onChange={handleChange}
              className={`w-full rounded border py-3 px-4.5  ${
                initialData.dateOfBirth
                  ? 'border-stroke bg-gray-100 text-gray-500 disabled:cursor-not-allowed dark:border-form-strokedark dark:bg-gray-700 dark:text-gray-400'
                  : 'border-stroke bg-gray text-black focus:border-primary active:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary'
              }`}
              disabled={!!initialData.dateOfBirth}
            />
            {!initialData.dateOfBirth && (
              <p className="mt-1 text-warning text-sm">Please add your date of birth.</p>
            )}
          </div>
        </div>
        <div className="mb-5.5">
          <InputText
            type="email"
            label="Email Address"
            name="email"
            value={formData.email ?? ''}
            onChange={handleChange}
            placeholder="example@gmail.com"
            disabled={!isFieldEditable('email')}
          />
        </div>

        <div className="mb-5.5">
          <InputPhoneNumber
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber ?? ''}
            onChange={value => handleChange(value, 'phone')}
            disabled={!isFieldEditable('phoneNumber')}
          />
        </div>

        <div className="border-b border-stroke py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Emergency Contact</h3>
        </div>

        <div className="mt-5.5">
          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <InputText
              label="First Name"
              name="emergencyContact.firstName"
              value={formData.emergencyContact?.firstName ?? ''}
              onChange={handleChange}
              placeholder="Emergency contact first name"
              disabled={!isFieldEditable('emergencyContact')}
            />

            <InputText
              label="Last Name"
              name="emergencyContact.lastName"
              value={formData.emergencyContact?.lastName ?? ''}
              onChange={handleChange}
              placeholder="Emergency contact last name"
              disabled={!isFieldEditable('emergencyContact')}
            />
          </div>

          <div className="mb-5.5">
            <InputText
              type="email"
              label="Email Address"
              name="emergencyContact.email"
              value={formData.emergencyContact?.email ?? ''}
              onChange={handleChange}
              placeholder="Emergency contact email"
              disabled={!isFieldEditable('emergencyContact')}
            />
          </div>

          <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
            <div className="w-full sm:w-1/2">
              <InputPhoneNumber
                label="Phone Number"
                name="emergencyContact.phoneNumber"
                value={formData.emergencyContact?.phoneNumber ?? ''}
                onChange={value => handleChange(value || '', 'emergency')}
                disabled={!isFieldEditable('emergencyContact')}
              />
            </div>
            <SelectGroup
              label="Relationship"
              value={formData.emergencyContact?.relationship ?? ''}
              onChange={handleChange}
              options={selectOptions.emergencyContactRelationshipToMember}
              name="emergencyContact.relationship"
              id="emergencyContact.relationship"
              disabled={!isFieldEditable('emergencyContact')}
            />
          </div>
        </div>

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
