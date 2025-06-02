import { TLinkStatus } from '@shared/types/registration.link.types';

interface ICreatedBy {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IRegistrationLink {
  id: string;
  expiresAt: string;
  usageCount: number;
  maxUses: number | null;
  createdBy: ICreatedBy;
  gym: string;
  createdAt: string;
  status: TLinkStatus;
  revokedBy: ICreatedBy | null;
  revokedAt: string | null;
}
export interface IRegistrationLinksResponse {
  links: IRegistrationLink[];
}
