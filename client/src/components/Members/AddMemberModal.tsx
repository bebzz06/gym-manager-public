import { useState, useEffect, useRef } from 'react';
import { CloseIcon } from '@/components/Icons';
import { searchGuardianByEmail, createMember, getMembers } from '@/http/Member';
import PhoneInput from 'react-phone-number-input';
import { IMemberCreateData } from '@/types/user.types';
import { TEmergencyContactRelationshipToMember, TUserRole } from '@shared/types/user.types';
import { EmergencyContactRelationshipToMember, UserRole } from '@shared/constants/user';
import toast from 'react-hot-toast';
import { fetchMembersSuccess } from '@/store/slices/membersSlice';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { calculateAge } from '@shared/utils/age';
import { useAppSelector } from '@/hooks/useAppSelector';

interface AddMemberModalProps {
  popupOpen: boolean;
  setPopupOpen: (open: boolean) => void;
}

interface IFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  role: TUserRole | null;
  isGuardianMember: boolean | null;
  guardianEmail: string;
  guardian: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    relationship: TEmergencyContactRelationshipToMember | string;
  };
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ popupOpen, setPopupOpen }) => {
  const dispatch = useAppDispatch();
  const initialState: IFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    role: null,
    isGuardianMember: null,
    guardianEmail: '',
    guardian: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      relationship: '',
    },
  };

  const [formData, setFormData] = useState(initialState);
  const gymData = useAppSelector(state => state.gym);
  const [requiresGuardian, setRequiresGuardian] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guardianSearchError, setGuardianSearchError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const currentUser = useAppSelector(state => state.profile);
  const canAssignStaffRoles =
    currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.OWNER;

  // Add a ref for the form container
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Function to set error and scroll to top
  const setErrorWithScroll = (errorMessage: string) => {
    setError(errorMessage);
    // Scroll to the top of the form container
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setRequiresGuardian(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    setPopupOpen(false);
  };

  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(new Date(formData.dateOfBirth));
      setRequiresGuardian(age < 18);
    }
  }, [formData.dateOfBirth]);

  const handleGuardianSearch = async () => {
    try {
      setGuardianSearchError(''); // Clear any previous errors
      const guardian = await searchGuardianByEmail(formData.guardianEmail);
      if (guardian) {
        setFormData(prev => ({
          ...prev,
          guardian: {
            firstName: guardian.firstName,
            lastName: guardian.lastName,
            email: guardian.email,
            phoneNumber: guardian.phoneNumber,
            relationship: prev.guardian.relationship,
          },
        }));
      }
    } catch (error: any) {
      console.error('Guardian search failed:', error);
      setGuardianSearchError(error.message || 'Error searching for guardian');
      // Reset guardian form for manual entry
      setFormData(prev => ({
        ...prev,
        guardian: {
          firstName: '',
          lastName: '',
          email: formData.guardianEmail,
          phoneNumber: '',
          relationship: '',
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.dateOfBirth ||
      !formData.role
    ) {
      setErrorWithScroll('Please fill in all required fields');
      return;
    }

    // Guardian validation for minors
    if (requiresGuardian) {
      if (
        !formData.guardian.firstName ||
        !formData.guardian.lastName ||
        !formData.guardian.email ||
        !formData.guardian.phoneNumber ||
        !formData.guardian.relationship
      ) {
        setErrorWithScroll('Please complete all guardian information');
        return;
      }
    }

    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      // Prepare member data
      const memberData: IMemberCreateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        role: formData.role,
      };

      // Add guardian information if required
      if (requiresGuardian && formData.guardian) {
        memberData.guardian = {
          firstName: formData.guardian.firstName,
          lastName: formData.guardian.lastName,
          email: formData.guardian.email,
          phoneNumber: formData.guardian.phoneNumber,
          relationship: formData.guardian.relationship as TEmergencyContactRelationshipToMember,
        };
        // Use guardian as emergency contact for minors
        memberData.emergencyContact = memberData.guardian;
      }

      // Create member
      await createMember(memberData);
      setPopupOpen(false);
      toast.success('Member created successfully');
      // Refresh members list
      const data = await getMembers();
      dispatch(fetchMembersSuccess(data));
      resetForm();
    } catch (error: any) {
      console.error('Member creation error:', error);
      setErrorWithScroll(error.response?.data?.message || error.message || 'Error creating member');
      toast.error(error.message || 'Error creating member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5 ${
        popupOpen ? 'block' : 'hidden'
      }`}
    >
      <div className="relative w-full max-w-142.5 rounded-lg bg-white dark:bg-boxdark">
        <div className="sticky top-0 z-10 bg-white px-8 py-4 dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-black dark:text-white sm:text-2xl">
              Add New Member
            </h3>
            <button
              onClick={handleClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-black transition hover:bg-white hover:text-primary dark:text-white"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div ref={formContainerRef} className="max-h-[calc(100vh-200px)] overflow-y-auto px-8 py-8">
          <form id="memberForm" onSubmit={handleSubmit} className="text-left">
            {error && <div className="mb-4 text-danger text-red-500">{error}</div>}
            <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div className="w-full sm:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Phone Number
              </label>
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry={gymData?.address?.country as any}
                value={formData.phoneNumber}
                onChange={value => setFormData({ ...formData, phoneNumber: value || '' })}
              />
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Date of Birth
              </label>
              <input
                type="date"
                placeholder="Select date of birth"
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="mb-5.5">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Role
              </label>
              <select
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                value={formData.role || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    role: e.target.value as TUserRole,
                  })
                }
              >
                <option value="">Select role</option>
                <option disabled={!canAssignStaffRoles} value={UserRole.ADMIN}>
                  Admin
                </option>
                <option disabled={!canAssignStaffRoles} value={UserRole.STAFF}>
                  Staff
                </option>
                <option value={UserRole.MEMBER}>Member</option>
              </select>
            </div>

            {requiresGuardian && (
              <>
                <div className="mb-5.5">
                  <div className="rounded-sm border border-warning bg-warning bg-opacity-10 px-4 py-3 text-warning">
                    Members under 18 years old require guardian information
                  </div>
                </div>

                <div className="mb-5.5">
                  <h4 className="mb-3 text-sm font-medium text-black dark:text-white">
                    Guardian Information
                  </h4>

                  <div className="mb-4">
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                      Is the guardian a member already?
                    </label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="isGuardianMember"
                          className="form-radio"
                          checked={formData.isGuardianMember === true}
                          onChange={() =>
                            setFormData(prev => ({
                              ...prev,
                              isGuardianMember: true,
                              guardianEmail: '',
                              guardian: {
                                firstName: '',
                                lastName: '',
                                email: '',
                                phoneNumber: '',
                                relationship: '',
                              },
                            }))
                          }
                        />
                        <span className="ml-2 text-sm font-medium text-black dark:text-white">
                          Yes
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="isGuardianMember"
                          className="form-radio"
                          checked={formData.isGuardianMember === false}
                          onChange={() =>
                            setFormData(prev => ({
                              ...prev,
                              isGuardianMember: false,
                              guardianEmail: '',
                              guardian: {
                                firstName: '',
                                lastName: '',
                                email: '',
                                phoneNumber: '',
                                relationship: '',
                              },
                            }))
                          }
                        />
                        <span className="ml-2 text-sm font-medium text-black dark:text-white">
                          No
                        </span>
                      </label>
                    </div>
                  </div>

                  {formData.isGuardianMember === true && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <div className="w-full">
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Guardian Email
                          </label>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <input
                                type="email"
                                placeholder="Enter guardian's email"
                                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                                value={formData.guardianEmail}
                                onChange={e =>
                                  setFormData({ ...formData, guardianEmail: e.target.value })
                                }
                              />
                              <button
                                type="button"
                                onClick={handleGuardianSearch}
                                className="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                              >
                                Search
                              </button>
                            </div>
                            {guardianSearchError && (
                              <span className="text-sm text-danger">{guardianSearchError}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {(formData.isGuardianMember === false || formData.guardian.firstName) && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            First Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter guardian's first name"
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            value={formData.guardian.firstName}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                guardian: { ...formData.guardian, firstName: e.target.value },
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Last Name
                          </label>
                          <input
                            type="text"
                            placeholder="Enter guardian's last name"
                            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                            value={formData.guardian.lastName}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                guardian: { ...formData.guardian, lastName: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="Enter guardian's email"
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          value={formData.guardian.email}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              guardian: { ...formData.guardian, email: e.target.value },
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                          Phone Number
                        </label>
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry={gymData?.address?.country as any}
                          value={formData.guardian.phoneNumber}
                          onChange={value =>
                            setFormData({
                              ...formData,
                              guardian: { ...formData.guardian, phoneNumber: value || '' },
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                          Relationship
                        </label>
                        <select
                          className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                          value={formData.guardian.relationship}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              guardian: { ...formData.guardian, relationship: e.target.value },
                            })
                          }
                        >
                          <option value="">Select relationship to member</option>
                          <option value={EmergencyContactRelationshipToMember.PARENT}>
                            Parent
                          </option>
                          <option value={EmergencyContactRelationshipToMember.GUARDIAN}>
                            Guardian
                          </option>
                          <option value={EmergencyContactRelationshipToMember.SPOUSE}>
                            Spouse
                          </option>
                          <option value={EmergencyContactRelationshipToMember.SIBLING}>
                            Sibling
                          </option>
                          <option value={EmergencyContactRelationshipToMember.OTHER}>Other</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        <div className="sticky bottom-0 bg-white px-8 py-4 dark:bg-boxdark">
          <div className="flex justify-end gap-4.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              form="memberForm"
              type="submit"
              disabled={loading}
              className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
