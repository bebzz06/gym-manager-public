export interface IFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  dateOfBirth: string;
  guardian: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relationship: string;
  };
}

interface IValidation {
  condition: boolean;
  message: string;
}

export const validateMemberForm = (
  formData: IFormData,
  requiresGuardian: boolean,
  setError: (error: string) => void
): boolean => {
  const validations: IValidation[] = [
    {
      condition: !formData.firstName.trim(),
      message: 'First name is required',
    },
    {
      condition: !formData.lastName.trim(),
      message: 'Last name is required',
    },
    {
      condition: !formData.email.trim(),
      message: 'Email is required',
    },
    {
      condition: !formData.dateOfBirth,
      message: 'Date of birth is required',
    },
    {
      condition: !formData.phoneNumber,
      message: 'Phone number is required',
    },
    {
      condition: !formData.password,
      message: 'Password is required',
    },
    // {
    //   condition: formData.password.length < 6,
    //   message: 'Password must be at least 6 characters',
    // },
    {
      condition: formData.password !== formData.confirmPassword,
      message: 'Passwords do not match',
    },
  ];

  const guardianValidations: IValidation[] = [
    {
      condition: !formData.guardian.firstName.trim(),
      message: 'Guardian first name is required',
    },
    {
      condition: !formData.guardian.lastName.trim(),
      message: 'Guardian last name is required',
    },
    {
      condition: !formData.guardian.email.trim(),
      message: 'Guardian email is required',
    },
    {
      condition: !formData.guardian.phoneNumber,
      message: 'Guardian phone number is required',
    },
    {
      condition: !formData.guardian.relationship,
      message: 'Guardian relationship is required',
    },
  ];

  const allValidations = requiresGuardian ? [...validations, ...guardianValidations] : validations;

  const error = allValidations.find(validation => validation.condition);

  if (error) {
    setError(error.message);
    return false;
  }

  return true;
};
