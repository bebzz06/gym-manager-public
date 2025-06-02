import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateRegistrationLink } from '@/http/RegistrationLink';
import { register } from '@/http/Auth';
import { toast } from 'react-hot-toast';
import { ROUTES } from '@/constants';
import { UserIcon, EmailIcon, PasswordIcon } from '@/components/Icons';
import PhoneInput from 'react-phone-number-input';
import { EmergencyContactRelationshipToMember } from '@shared/constants/user';
import { validateMemberForm } from '@/utils/formValidation';
import { TEmergencyContactRelationshipToMember } from '@shared/types/user.types';
import { Tooltip } from '@/common/Tooltip';
import { TooltipPosition } from '@/constants';
import { getPasswordRequirements } from '@shared/utils/messages';
import { calculateAge } from '@shared/utils/age';
import AuthPagesLayout from '@/layouts/AuthPagesLayout';

const MemberRegistration: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gymName, setGymName] = useState('');
  const [country, setCountry] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    guardian: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      relationship: '',
    },
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [requiresGuardian, setRequiresGuardian] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkLinkValidity = async () => {
      try {
        if (!token) return;
        const response = await validateRegistrationLink(token);
        if (isMounted) {
          setIsRateLimited(false);
          setGymName(response.gymName);
          setCountry(response.gymAddress.country);
        }
      } catch (error: any) {
        if (!isMounted) return;

        if (error.isRateLimit) {
          setIsRateLimited(true);
          toast.error(`${error.response.data.message}`);
        } else {
          const errorMessage =
            error.response?.data?.message || error.message || 'Invalid registration link';
          toast.error(errorMessage);
          navigate(ROUTES.INVALID_LINK);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkLinkValidity();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(new Date(formData.dateOfBirth));
      setRequiresGuardian(age < 18);
    }
  }, [formData.dateOfBirth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // First validate the form inputs
    if (!validateMemberForm(formData, requiresGuardian, setError)) {
      return;
    }

    setLoading(true);
    try {
      // Then validate the registration link
      if (!token) {
        setError('Invalid registration link');
        return;
      }
      // await validateRegistrationLink(token);

      // Only proceed with user creation if both validations pass
      //api call to create user
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        token,
        ...(requiresGuardian && {
          guardian: {
            ...formData.guardian,
            relationship: formData.guardian.relationship as TEmergencyContactRelationshipToMember,
          },
        }),
      });
      if (response.user) {
        navigate(ROUTES.REGISTRATION_CONFIRMATION, { state: { email: formData.email } });
      }
    } catch (error: any) {
      if (error.isRateLimit) {
        setIsRateLimited(true);
        toast.error(`${error.response.data.message}`);
      } else {
        toast.error(error.response.data.message);
      }
      return;
    } finally {
      setLoading(false);
    }
  };

  if (isRateLimited) {
    return (
      <AuthPagesLayout
        title="Too Many Attempts"
        subtitle="Please wait a few minutes before trying to access this registration link again."
        loading={false}
      >
        <div className="mt-7.5 text-center">
          <p className="font-medium text-body-color">
            Please wait a few minutes before trying to access this registration link again.
          </p>
        </div>
      </AuthPagesLayout>
    );
  }

  return (
    <AuthPagesLayout
      title={`Register to ${gymName || 'your gym'}`}
      subtitle={`Register to ${gymName || 'your gym'} to get started.`}
      loading={loading}
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">First Name</label>
          <div className="relative">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <span className="absolute right-4 top-4">
              <UserIcon />
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">Last Name</label>
          <div className="relative">
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">Email</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <span className="absolute right-4 top-4">
              <EmailIcon />
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Phone Number
          </label>
          <div className="relative">
            <PhoneInput
              international
              value={formData.phoneNumber}
              defaultCountry={country as any}
              onChange={value => setFormData({ ...formData, phoneNumber: value || '' })}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Date of Birth
          </label>
          <div className="relative">
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        </div>

        {requiresGuardian && (
          <>
            <div className="mb-4">
              <div className="rounded-sm border border-warning bg-warning bg-opacity-10 px-4 py-3 text-warning">
                Members under 18 years old require guardian information
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Guardian First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="guardian.firstName"
                  value={formData.guardian.firstName}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, firstName: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <span className="absolute right-4 top-4">
                  <UserIcon />
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Guardian Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="guardian.lastName"
                  value={formData.guardian.lastName}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, lastName: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <span className="absolute right-4 top-4">
                  <UserIcon />
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Guardian Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="guardian.email"
                  value={formData.guardian.email}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, email: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <span className="absolute right-4 top-4">
                  <EmailIcon />
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Guardian Phone Number
              </label>
              <div className="relative">
                <PhoneInput
                  international
                  defaultCountry={country as any}
                  value={formData.guardian.phoneNumber}
                  onChange={value =>
                    setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, phoneNumber: value || '' },
                    })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2.5 block font-medium text-black dark:text-white">
                Relationship to Member
              </label>
              <div className="relative">
                <select
                  name="guardian.relationship"
                  value={formData.guardian.relationship}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      guardian: { ...formData.guardian, relationship: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select relationship</option>
                  <option value={EmergencyContactRelationshipToMember.PARENT}>Parent</option>
                  <option value={EmergencyContactRelationshipToMember.GUARDIAN}>Guardian</option>
                  <option value={EmergencyContactRelationshipToMember.SPOUSE}>Spouse</option>
                  <option value={EmergencyContactRelationshipToMember.SIBLING}>Sibling</option>
                  <option value={EmergencyContactRelationshipToMember.OTHER}>Other</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="mb-4">
          <label className="mb-2.5 block font-medium text-black dark:text-white">Password</label>
          <div className="relative">
            <Tooltip
              position={TooltipPosition.BOTTOM}
              message={
                <ol className="list-decimal pl-4">
                  {getPasswordRequirements().map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ol>
              }
            >
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </Tooltip>
            <span className="absolute right-4 top-4">
              <PasswordIcon />
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2.5 block font-medium text-black dark:text-white">
            Re-type Password
          </label>
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            <span className="absolute right-4 top-4">
              <PasswordIcon />
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-danger bg-opacity-10 border border-danger text-danger text-sm">
            {error}
          </div>
        )}

        <div className="mb-5">
          <input
            type="submit"
            value="Create account"
            className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
          />
        </div>
      </form>
    </AuthPagesLayout>
  );
};

export default MemberRegistration;
