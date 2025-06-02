import httpClient from '@/http';
import { store } from '@/store';
import { refreshFailure } from '@/store/slices/authSlice';
import { clearProfileData } from '@/store/slices/profileSlice';
import { clearGymData } from '@/store/slices/gymSlice';
import { API_ENDPOINTS } from '@/constants/routes';
import { SESSION_MESSAGES } from '@shared/constants/messages';
// Define proper types
//handling of 401 errors
interface QueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const isSkipRefreshEndpoint = (url: string) => {
  const noRefreshEndpoints = [API_ENDPOINTS.AUTH.REFRESH, API_ENDPOINTS.AUTH.LOGIN];
  return noRefreshEndpoints.some(endpoint => url.includes(endpoint));
};

const handleRefreshTokenFailure = (error: any) => {
  store.dispatch(refreshFailure(error.response?.data?.message));
  store.dispatch(clearProfileData());
  store.dispatch(clearGymData());
  processQueue(error);
  isRefreshing = false;

  // Only redirect if not already on signin page
  // if (!window.location.pathname.includes('/signin')) {
  //   window.location.href = '/signin';
  // }
};
const isForcedSessionInvalidation = (error: any): boolean => {
  return (
    error.response?.status === 401 &&
    error.response?.data?.message === SESSION_MESSAGES.ERRORS.INVALID
  );
};
httpClient.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    // Handle session invalidation
    if (isForcedSessionInvalidation(error)) {
      // Clear user data immediately
      store.dispatch(refreshFailure(error.response?.data?.message));
      store.dispatch(clearProfileData());
      store.dispatch(clearGymData());

      // Cancel all pending requests
      processQueue(error);

      return Promise.reject(error);
    }

    // If it's a refresh token request that failed, clear auth state
    if (error.response?.status === 401 && isSkipRefreshEndpoint(originalRequest.url)) {
      console.log('Refresh token failure');
      handleRefreshTokenFailure(new Error('Refresh token failed'));
      return Promise.reject(error);
    }

    // Don't attempt refresh for auth requests or if already retrying
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isSkipRefreshEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        try {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        } catch (err) {
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      try {
        await httpClient.put(API_ENDPOINTS.AUTH.REFRESH);
        processQueue(null);
        isRefreshing = false;
        return httpClient(originalRequest);
      } catch (refreshError) {
        handleRefreshTokenFailure(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
