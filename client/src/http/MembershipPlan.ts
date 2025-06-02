import httpClient from '@/http';
import { API_ENDPOINTS } from '@/constants/routes';
import { IMembershipPlanData } from '@/types/membership.plan.types';

export const getMembershipPlans = async () => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.MEMBERSHIP_PLANS.GET_ALL);
    return response.data.plans;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error fetching membership plans');
  }
};

export const createMembershipPlan = async (data: IMembershipPlanData) => {
  try {
    const response = await httpClient.post(API_ENDPOINTS.MEMBERSHIP_PLANS.CREATE, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error creating membership plan');
  }
};

export const toggleMembershipPlanStatus = async (planId: string) => {
  try {
    const response = await httpClient.patch(API_ENDPOINTS.MEMBERSHIP_PLANS.TOGGLE_STATUS(planId));
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error toggling membership plan status');
  }
};
