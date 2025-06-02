import httpClient from '@/http';
import { ILoginResponse, ISessionValidationResponse } from '@/types/auth.types';
import { ISelfRegistrationData, ISelfRegistrationResponse } from '@/types/user.types';
import { API_ENDPOINTS } from '@/constants/routes';

//This register will be used when members will create their own accounts
export const register = async (data: ISelfRegistrationData): Promise<ISelfRegistrationResponse> => {
  try {
    const response = await httpClient.post<ISelfRegistrationResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  } catch (error) {
    // Need to handle:
    // - Network errors
    // - Validation errors (email exists, invalid data)
    // - Server errors
    throw error; // Let component handle specific error cases
  }
};

interface IConfirmAccountResponse {
  needsPasswordSetup?: boolean;
  message: string;
  token: string;
  email: string;
}

//confirm account
export const confirmAccount = async (token: string): Promise<IConfirmAccountResponse> => {
  try {
    const response = await httpClient.get<IConfirmAccountResponse>(
      `${API_ENDPOINTS.AUTH.ACCOUNT_CONFIRMATION}${token}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//resend verification email
export const resendVerificationEmail = async (email: string): Promise<void> => {
  try {
    await httpClient.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION_EMAIL, { email });
  } catch (error) {
    throw error;
  }
};

// Set auth token in axios headers
const setAuthHeader = (token: string | null) => {
  if (token) {
    httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete httpClient.defaults.headers.common['Authorization'];
  }
};

export const login = async (email: string, password: string): Promise<ILoginResponse> => {
  try {
    const response = await httpClient.post<ILoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    if (response.data.accessToken) {
      setAuthHeader(response.data.accessToken);
    } else {
      throw new Error('No access token received');
    }

    return response.data;
  } catch (error) {
    setAuthHeader(null);
    throw error;
  }
};

//for manual refresh, User-Initiated Session Extension: Session Timeout Warning, Active Session Maintenance.
export const refresh = async (): Promise<{ token: string }> => {
  const response = await httpClient.put(
    API_ENDPOINTS.AUTH.REFRESH,
    {},
    {
      withCredentials: true,
    }
  );
  setAuthHeader(response.data.token);
  return response.data;
};

export const logout = async (): Promise<void> => {
  try {
    await httpClient.delete(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    setAuthHeader(null);
  }
};

export const validateSession = async (): Promise<ISessionValidationResponse> => {
  const response = await httpClient.get<ISessionValidationResponse>(
    API_ENDPOINTS.AUTH.VALIDATE_SESSION
  );
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    await httpClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  } catch (error: any) {
    throw error;
  }
};

// Request password reset email
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await httpClient.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
  } catch (error) {
    throw error;
  }
};

// Verify reset token when user clicks email link
export const verifyResetToken = async (token: string): Promise<void> => {
  try {
    await httpClient.get(`${API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET_TOKEN}${token}`);
  } catch (error) {
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    await httpClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
  } catch (error) {
    throw error;
  }
};

export const sendMemberSetupEmail = async (email: string): Promise<void> => {
  try {
    await httpClient.post(API_ENDPOINTS.AUTH.SEND_MEMBER_SETUP_EMAIL, { email });
  } catch (error) {
    throw error;
  }
};

export const completeVerificationWithPassword = async (
  token: string,
  password: string
): Promise<void> => {
  try {
    await httpClient.post(API_ENDPOINTS.AUTH.MEMBER_SETUP_CONFIRMATION, {
      token,
      password,
    });
  } catch (error) {
    throw error;
  }
};
