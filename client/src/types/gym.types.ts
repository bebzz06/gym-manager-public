import { IGymState } from '@/types/store.types';
export interface IGymRegistrationData {
  gymName: string;
  country: string;
  city: string;
  region: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IGymResponse {
  message: string;
  gym: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
    role: string;
  };
}
export interface IGymUpdateData extends IGymState {}
