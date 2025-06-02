import httpClient from '@/http';
import { IProfileData } from '@/types/profile.types';
import { API_ENDPOINTS } from '@/constants/routes';

export const updateProfile = async (profileData: IProfileData) => {
  try {
    const { data } = await httpClient.put(API_ENDPOINTS.PROFILE.PROFILE, profileData);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error updating profile');
  }
};

export const getProfile = async () => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.PROFILE.PROFILE);
    return response.data.user;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw new Error(error.response?.data?.message || 'Error fetching user profile');
  }
};

export const uploadProfilePicture = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', file);

    const { data } = await httpClient.post(API_ENDPOINTS.PROFILE.PROFILE_PICTURE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error uploading profile picture');
  }
};

export const deleteProfilePicture = async () => {
  try {
    const { data } = await httpClient.delete(API_ENDPOINTS.PROFILE.PROFILE_PICTURE);
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error deleting profile picture');
  }
};
