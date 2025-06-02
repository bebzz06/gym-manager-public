import { TUserRole } from '@shared/types/user.types';
export interface ILoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: TUserRole;
  };
  accessToken: string;
}
export interface ISessionValidationResponse {
  valid: boolean;
  userId?: string;
  message?: string;
}
