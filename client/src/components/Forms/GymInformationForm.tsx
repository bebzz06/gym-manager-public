import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import toast from 'react-hot-toast';
import { ROUTES } from '@/constants';
import { updateGymProfile, setLoading, setError } from '@/store/slices/gymSlice';
import { uploadGymLogo, deleteGymLogo, updateGymInfo } from '@/http/Gym';
import { ConfirmDialog } from '@/common/ConfirmDialog';
import isEqual from 'lodash/isEqual';
import PhoneInput from 'react-phone-number-input';
import CountrySelect from '@/components/Forms/CountrySelect';

export const GymInformationForm = () => {
  const dispatch = useAppDispatch();
  const gymData = useAppSelector(state => state.gym);
  const { loading } = gymData;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: gymData?.name ?? '',
    email: gymData?.email ?? '',
    address: {
      addressLine1: gymData?.address?.addressLine1 ?? '',
      addressLine2: gymData?.address?.addressLine2 ?? '',
      city: gymData?.address?.city ?? '',
      region: gymData?.address?.region ?? '',
      postalCode: gymData?.address?.postalCode ?? '',
      country: gymData?.address?.country ?? 'US',
    },
    phoneNumber: gymData?.phoneNumber ?? '',
    website: gymData?.website ?? '',
    description: gymData?.description ?? '',
  });

  const [initialFormData, setInitialFormData] = useState(formData);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(gymData?.logo?.url || null);
  const [initialPreviewUrl, setInitialPreviewUrl] = useState<string | null>(
    gymData?.logo?.url || null
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gymData) {
      const newFormData = {
        name: gymData.name ?? '',
        email: gymData.email ?? '',
        address: {
          addressLine1: gymData.address?.addressLine1 ?? '',
          addressLine2: gymData.address?.addressLine2 ?? '',
          city: gymData.address?.city ?? '',
          region: gymData.address?.region ?? '',
          postalCode: gymData.address?.postalCode ?? '',
          country: gymData.address?.country ?? 'US',
        },
        phoneNumber: gymData.phoneNumber ?? '',
        website: gymData.website ?? '',
        description: gymData.description ?? '',
      };
      setFormData(newFormData);
      setInitialFormData(newFormData);
      setPreviewUrl(gymData.logo?.url || null);
      setInitialPreviewUrl(gymData.logo?.url || null);
    }
  }, [
    gymData.name,
    gymData.email,
    gymData.address,
    gymData.phoneNumber,
    gymData.website,
    gymData.description,
    gymData.logo,
  ]);

  const hasChanges = useMemo(() => {
    const formDataChanged = !isEqual(formData, initialFormData);
    const logoChanged = previewUrl !== initialPreviewUrl;
    return formDataChanged || logoChanged;
  }, [formData, initialFormData, previewUrl, initialPreviewUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    field?: string
  ) => {
    if (typeof e === 'string' && field === 'phone') {
      setFormData(prev => ({
        ...prev,
        phoneNumber: e,
      }));
      return;
    }

    if (typeof e !== 'string') {
      const { name, value } = e.target;

      if (name.startsWith('address.')) {
        const addressField = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            [addressField]: value,
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    setLogoFile(null);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setPreviewUrl(initialPreviewUrl);
    setLogoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    try {
      dispatch(setLoading(true));

      const updatedGym = await updateGymInfo({
        email: formData.email,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        website: formData.website,
        description: formData.description,
      });

      dispatch(updateGymProfile(updatedGym));

      if (logoFile) {
        const logoData = await uploadGymLogo(logoFile);
        dispatch(updateGymProfile({ logo: logoData }));
      } else if (previewUrl === null && initialPreviewUrl !== null) {
        await deleteGymLogo();
        dispatch(updateGymProfile({ logo: null }));
      }

      setInitialFormData(formData);
      setInitialPreviewUrl(previewUrl);
      setLogoFile(null);

      toast.success('Gym information updated successfully');
    } catch (err: any) {
      dispatch(setError(err.message || 'Error updating gym information'));
      toast.error(err.message || 'Error updating gym information');
    } finally {
      dispatch(setLoading(false));
      navigate(ROUTES.HOME);
    }
  };

  useEffect(() => {
    if (buttonsRef.current) {
      buttonsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logoFile, previewUrl]);

  return (
    <div className="sm:px-60 sm:py-10">
      <form onSubmit={handleSubmit} className="text-left">
        {/* Logo Upload Section */}
        <div className="mb-5.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Gym Logo
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-50 w-50 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center self-center">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Gym Logo" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute top-1 right-23 flex h-2 w-3 items-center justify-center rounded-full text-gray-700 hover:text-warning"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <span className="text-gray-400">No Logo</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="relative inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer opacity-0"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <span>Upload Logo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="name"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Gym Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter gym name"
            disabled={true}
            className="w-full rounded border-[1.5px] border-stroke bg-gray-100 py-3 px-5 text-gray-500 outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed dark:border-form-strokedark dark:bg-gray-700 dark:text-gray-400"
          />
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="email"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter gym email"
            disabled={loading}
            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="phoneNumber"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Phone Number
          </label>
          <PhoneInput
            international
            countryCallingCodeEditable={false}
            defaultCountry={gymData?.address?.country as any}
            value={formData.phoneNumber}
            onChange={value => handleChange(value || '', 'phone')}
            disabled={loading}
          />
        </div>

        {/* Address Section */}
        <div className="mb-5.5">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Address
          </label>
          <div className="space-y-4">
            <input
              type="text"
              name="address.addressLine1"
              value={formData.address.addressLine1}
              onChange={handleChange}
              placeholder="Address Line 1"
              disabled={loading}
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            />
            <input
              type="text"
              name="address.addressLine2"
              value={formData.address.addressLine2}
              onChange={handleChange}
              placeholder="Address Line 2 (Optional)"
              disabled={loading}
              className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="City"
                disabled={loading}
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              />
              <input
                type="text"
                name="address.region"
                value={formData.address.region}
                onChange={handleChange}
                placeholder="State/Region"
                disabled={loading}
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              />
            </div>
            <div className="space-y-4">
              <input
                type="text"
                name="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                disabled={loading}
                className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              />
              <CountrySelect
                name="address.country"
                value={formData.address.country}
                onChange={() => {}}
                disabled={true}
              />
            </div>
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="website"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            disabled={loading}
            value={formData.website}
            onChange={handleChange}
            placeholder="Enter gym website"
            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="description"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter gym description"
            disabled={loading}
            className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
          />
        </div>

        {/* Submit and Cancel Buttons */}
        {hasChanges && (
          <div ref={buttonsRef} className="flex justify-center gap-4.5">
            <button
              type="button"
              onClick={handleCancel}
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
              disabled={loading}
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
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Changes"
        message="Are you sure you want to save these changes?"
        confirmText="Save Changes"
      />
    </div>
  );
};

export default GymInformationForm;
