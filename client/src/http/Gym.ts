import httpClient from '@/http';
import { IGymRegistrationData, IGymResponse, IGymUpdateData } from '@/types/gym.types';
import { API_ENDPOINTS } from '@/constants/routes';

export const createGym = async (data: IGymRegistrationData): Promise<IGymResponse> => {
  const response = await httpClient.post<IGymResponse>(API_ENDPOINTS.GYM.REGISTER, data);
  return response.data;
};

export const uploadGymLogo = async (file: File): Promise<{ url: string; path: string }> => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await httpClient.post(API_ENDPOINTS.GYM.LOGO, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.logo;
};

export const deleteGymLogo = async (): Promise<void> => {
  await httpClient.delete(API_ENDPOINTS.GYM.LOGO);
};

export const updateGymInfo = async (data: Partial<IGymUpdateData>): Promise<IGymUpdateData> => {
  const response = await httpClient.put(API_ENDPOINTS.GYM.UPDATE, data);
  return response.data.gym;
};
