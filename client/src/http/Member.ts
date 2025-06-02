import httpClient from '@/http';
import { IUserResponse, IMemberCreateData, IMember } from '@/types/user.types';
import { API_ENDPOINTS } from '@/constants/routes';
import { TUserRole } from '@shared/types/user.types';

export const searchGuardianByEmail = async (email: string) => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.MEMBER.SEARCH_GUARDIAN_BY_EMAIL, {
      params: {
        email,
      },
    });
    return response.data.guardian;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error searching for guardian');
  }
};

export const createMember = async (data: IMemberCreateData): Promise<IUserResponse> => {
  try {
    const response = await httpClient.post<IUserResponse>(API_ENDPOINTS.MEMBER.CREATE, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error creating member');
  }
};

export const getMembers = async (roles?: TUserRole[]): Promise<IMember[]> => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.MEMBER.GET_ALL, {
      params: {
        roles: roles?.join(','),
      },
    });
    return response.data.members;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error fetching members');
  }
};

export const getMemberById = async (id: string) => {
  try {
    const response = await httpClient.get(`${API_ENDPOINTS.MEMBER.GET_BY_ID}${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error fetching member details');
  }
};

export const updateMember = async (id: string, data: Partial<IMemberCreateData>) => {
  try {
    const response = await httpClient.put(`${API_ENDPOINTS.MEMBER.UPDATE}${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error updating member');
  }
};

export const deleteMember = async (id: string): Promise<void> => {
  try {
    await httpClient.delete(`${API_ENDPOINTS.MEMBER.DELETE}${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error deleting member');
  }
};

export const searchMembers = async (
  searchTerm: string,
  roles?: TUserRole[]
): Promise<IMember[]> => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.MEMBER.SEARCH, {
      params: {
        query: searchTerm,
        roles: roles?.join(','),
      },
    });
    return response.data.members;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error searching for members');
  }
};
