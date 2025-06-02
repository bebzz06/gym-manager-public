import httpClient from '@/http';
import { API_ENDPOINTS } from '@/constants/routes';
import { IRegistrationLink, IRegistrationLinksResponse } from '@/types/registration.link.types';
import { AxiosError } from 'axios';
export const generateRegistrationLink = async () => {
  try {
    const response = await httpClient.post(API_ENDPOINTS.REGISTRATION.GENERATE_LINK);
    return response.data.link;
  } catch (error) {
    console.error('Error generating registration link:', error);
    throw error;
  }
};
export const getMemberRegistrationLinks = async (): Promise<IRegistrationLink[]> => {
  try {
    const response = await httpClient.get<IRegistrationLinksResponse>(
      API_ENDPOINTS.REGISTRATION.GET_LINKS
    );
    return response.data.links;
  } catch (error) {
    console.error('Error fetching member registration links:', error);
    throw error;
  }
};
export const validateRegistrationLink = async (token: string) => {
  try {
    const response = await httpClient.get(`${API_ENDPOINTS.REGISTRATION.VALIDATE_LINK}${token}`);
    return response.data;
  } catch (error) {
    console.error('Error validating registration link:', error);
    throw error;
  }
};

export const revokeRegistrationLink = async (id: string) => {
  try {
    const response = await httpClient.patch(`${API_ENDPOINTS.REGISTRATION.REVOKE_LINK}${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 400) {
        return error.response.data;
      }
    }
    console.error('Error revoking registration link:', error);
    throw error;
  }
};
export const expireRegistrationLink = async (id: string) => {
  try {
    const response = await httpClient.patch(`${API_ENDPOINTS.REGISTRATION.EXPIRE_LINK}${id}`);
    return response.data.link;
  } catch (error) {
    console.error('Error expiring registration link:', error);
    throw error;
  }
};
