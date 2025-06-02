import { TEmergencyContactRelationshipToMember } from '@shared/types/user.types';
export interface IEmergencyContact {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  relationship?: TEmergencyContactRelationshipToMember;
}

export interface IProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyContact?: IEmergencyContact;
  dateOfBirth?: string;
}
