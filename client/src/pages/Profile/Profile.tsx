import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import defaultImage from '@/images/user/default.jpg';
import { ChangePasswordModal } from './ChangePasswordModal';
import { PersonalInformationForm } from '@/components/Forms/PersonalInformationForm';
import { IProfileData } from '@/types/profile.types';
import { TEmergencyContactRelationshipToMember } from '@shared/types/user.types';
import {
  updateProfile,
  getProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from '@/http/Profile';
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from '@/store/slices/profileSlice';
import toast from 'react-hot-toast';
import { FetchLoader } from '@/common';
import { ConfirmDialog } from '@/common/ConfirmDialog';
import { WebPAwareImage } from '@/components/Images/WebPAwareImage';
import { ROUTES } from '@/constants/routes';
import { useNavigate } from 'react-router-dom';
import { BackArrow } from '@/components/Icons/BackArrow';
import { getBeltImage } from '@/utils';
import { MembershipInformation } from '@/components/Members';
import { UserRole } from '@shared/constants/user';

const Profile = () => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const dispatch = useAppDispatch();
  const profileData = useAppSelector(state => state.profile);
  const { firstName, lastName, loading } = profileData;
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IProfileData>({
    firstName: profileData?.firstName ?? '',
    lastName: profileData?.lastName ?? '',
    email: profileData?.email ?? '',
    dateOfBirth: profileData?.dateOfBirth ?? '',
    phoneNumber: profileData?.phoneNumber ?? '',
    emergencyContact: {
      firstName: profileData?.emergencyContact?.firstName ?? '',
      lastName: profileData?.emergencyContact?.lastName ?? '',
      email: profileData?.emergencyContact?.email ?? '',
      phoneNumber: profileData?.emergencyContact?.phoneNumber ?? '',
      relationship:
        (profileData?.emergencyContact?.relationship as TEmergencyContactRelationshipToMember) ??
        undefined,
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(profileData?.profileImage || null);
  const profileEditableFields = ['email', 'phoneNumber', 'emergencyContact'];
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName ?? '',
        lastName: profileData.lastName ?? '',
        email: profileData.email ?? '',
        dateOfBirth: profileData.dateOfBirth ?? '',
        phoneNumber: profileData.phoneNumber ?? '',
        emergencyContact: {
          firstName: profileData.emergencyContact?.firstName ?? '',
          lastName: profileData.emergencyContact?.lastName ?? '',
          email: profileData.emergencyContact?.email ?? '',
          phoneNumber: profileData.emergencyContact?.phoneNumber ?? '',
          relationship:
            (profileData.emergencyContact?.relationship as TEmergencyContactRelationshipToMember) ??
            undefined,
        },
      });
    }
  }, [
    profileData.email,
    profileData.phoneNumber,
    profileData.emergencyContact?.firstName,
    profileData.emergencyContact?.lastName,
    profileData.emergencyContact?.email,
    profileData.emergencyContact?.phoneNumber,
    profileData.emergencyContact?.relationship,
  ]);

  useEffect(() => {
    setProfileImage(profileData?.profileImage || null);
  }, [profileData?.profileImage]);

  const handleSubmit = async (formData: IProfileData) => {
    try {
      dispatch(updateProfileStart());

      const normalizedData = {
        ...formData,
        emergencyContact: formData.emergencyContact
          ? {
              ...formData.emergencyContact,
              relationship: formData.emergencyContact.relationship
                ? (formData.emergencyContact.relationship as TEmergencyContactRelationshipToMember)
                : undefined,
            }
          : undefined,
      };

      const response = await updateProfile(normalizedData);

      if (response.shouldLogout) {
        toast.success(response.message || 'Profile updated successfully. Please log in again.');
        navigate(ROUTES.SIGNIN, { replace: true });
        return;
      }
      const updatedUserProfile = await getProfile();
      dispatch(updateProfileSuccess(updatedUserProfile));
      setIsEditMode(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.log('err', err);
      dispatch(updateProfileFailure(err.message || 'Error updating profile'));
      toast.error(err.message || 'Error updating profile');
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      setIsUploading(true);
      const response = await uploadProfilePicture(file);

      dispatch(updateProfileSuccess({ ...profileData, profileImage: response.profileImage }));
      setProfileImage(response.profileImage);
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error uploading profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfilePictureDelete = async () => {
    try {
      setIsUploading(true);
      await deleteProfilePicture();

      dispatch(updateProfileSuccess({ ...profileData, profileImage: null }));
      setProfileImage(null);
      toast.success('Profile picture deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error deleting profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {!isEditMode ? (
        // Display mode - show profile information
        <div className="overflow-hidden min-h-screen rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 pb-6 sm:py-10 text-center lg:pb-8 xl:pb-11.5">
            <div className="relative z-30 mx-auto mt-2 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3">
              <div className="relative drop-shadow-2 h-full w-full">
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-200">
                    <div className="transform scale-50">
                      <FetchLoader />
                    </div>
                  </div>
                ) : (
                  <WebPAwareImage
                    externalSource={profileImage?.url}
                    defaultImage={defaultImage}
                    className="w-full h-full object-cover rounded-full"
                    alt="profile"
                  />
                )}

                <label
                  htmlFor="profile"
                  className={`absolute bottom-0 right-0 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="file"
                    name="profile"
                    id="profile"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    disabled={isUploading}
                  />
                  <svg
                    className="fill-current"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 11.9925 13.4874 12.3207C13.1592 12.6489 12.7141 12.8333 12.25 12.8333H1.75C1.28587 12.8333 0.840752 12.6489 0.512563 12.3207C0.184375 11.9925 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.00004 5.83329C6.03354 5.83329 5.25004 6.61679 5.25004 7.58329C5.25004 8.54979 6.03354 9.33329 7.00004 9.33329C7.96654 9.33329 8.75004 8.54979 8.75004 7.58329C8.75004 6.61679 7.96654 5.83329 7.00004 5.83329ZM4.08337 7.58329C4.08337 5.97246 5.38921 4.66663 7.00004 4.66663C8.61087 4.66663 9.91671 5.97246 9.91671 7.58329C9.91671 9.19412 8.61087 10.5 7.00004 10.5C5.38921 10.5 4.08337 9.19412 4.08337 7.58329Z"
                    />
                  </svg>
                </label>

                {/* Add delete button if there's a profile image */}
                {profileImage?.url && !isUploading && (
                  <button
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-danger hover:bg-red-600 sm:top-2 sm:right-2"
                    disabled={isUploading}
                    title="Delete profile picture"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <div className="flex justify-between items-center gap-4">
                <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
                  {firstName} {lastName}
                </h3>
                <img
                  src={getBeltImage(profileData?.rank?.belt, profileData?.rank?.stripes)}
                  alt="Belt"
                  className="w-20 h-20"
                />
              </div>
              {profileData.role === UserRole.MEMBER && (
                <div className="w-full max-w-md">
                  <MembershipInformation
                    membershipInfo={profileData.membershipInfo}
                    paymentHistory={profileData.paymentHistory}
                  />
                </div>
              )}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                >
                  Change Password
                </button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Edit mode - show form
        <div className="sm:px-60 sm:py-10">
          <div className="mb-6 flex flex-col gap-4 items-center sm:flex-row sm:justify-between">
            <h1 className="text-title-md2 font-semibold text-black dark:text-white">
              Edit Profile Information
            </h1>
            <button
              onClick={() => setIsEditMode(false)}
              className="flex items-center gap-2 text-sm text-primary"
            >
              <BackArrow />
              Back to Profile
            </button>
          </div>
          <PersonalInformationForm
            initialData={formData}
            onSubmit={handleSubmit}
            loading={loading}
            editableFields={profileEditableFields}
          />
        </div>
      )}

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleProfilePictureDelete}
        title="Delete Profile Picture"
        message="Are you sure you want to delete your profile picture? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default Profile;
