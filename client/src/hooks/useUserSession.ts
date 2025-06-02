import { useAppDispatch } from './useAppDispatch';
import { getProfile } from '@/http/Profile';
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
} from '@/store/slices/profileSlice';
import { setGymData } from '@/store/slices/gymSlice';
import {
  initializeAuthStart,
  initializeAuthSuccess,
  initializeAuthFailure,
} from '@/store/slices/authSlice';

export const useUserSession = () => {
  const dispatch = useAppDispatch();

  const fetchUserSession = async () => {
    try {
      dispatch(initializeAuthStart());
      dispatch(updateProfileStart());

      const response = await getProfile();

      const { gym, ...userData } = response;

      dispatch(updateProfileSuccess(userData));
      dispatch(initializeAuthSuccess());
      dispatch(setGymData(gym));
      return userData; // Return the user data so we can use it immediately
    } catch (error: any) {
      dispatch(initializeAuthFailure());
      dispatch(updateProfileFailure(error.message));
      throw error;
    }
  };

  return { fetchUserSession };
};
