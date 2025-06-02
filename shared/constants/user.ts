import { TUserRole } from '../types/user.types.js';
export const UserRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  MEMBER: 'MEMBER',
} as const;

export const UserRoleAccess = {
  [UserRole.OWNER]: ['OWNER'] as TUserRole[],
  [UserRole.ADMIN]: ['OWNER', 'ADMIN'] as TUserRole[],
  [UserRole.STAFF]: ['OWNER', 'ADMIN', 'STAFF'] as TUserRole[],
  [UserRole.MEMBER]: ['OWNER', 'ADMIN', 'STAFF', 'MEMBER'] as TUserRole[],
};

export const MembershipStatus = {
  // States that allow service access
  ACTIVE: 'ACTIVE', // Regular active member
  TRIAL: 'TRIAL', // Trial period with access
  // States that restrict service access
  PENDING: 'PENDING', // Initial setup, no access yet
  SUSPENDED: 'SUSPENDED', // Temporarily restricted
  INACTIVE: 'INACTIVE', // No longer active
  EXPIRED: 'EXPIRED', // Past due/expired membership
} as const;

//todo implement this ALL transitions after full recurrent payment integration
export const MembershipStatusTransitions = {
  [MembershipStatus.PENDING]: [MembershipStatus.ACTIVE, MembershipStatus.INACTIVE],
  [MembershipStatus.TRIAL]: [MembershipStatus.ACTIVE, MembershipStatus.INACTIVE],
  [MembershipStatus.ACTIVE]: [
    MembershipStatus.SUSPENDED,
    MembershipStatus.INACTIVE,
    MembershipStatus.EXPIRED,
  ],
  [MembershipStatus.SUSPENDED]: [MembershipStatus.ACTIVE, MembershipStatus.INACTIVE],
  [MembershipStatus.INACTIVE]: [MembershipStatus.PENDING], // Can only restart from beginning
  [MembershipStatus.EXPIRED]: [MembershipStatus.PENDING, MembershipStatus.INACTIVE],
} as const;

export const MembershipType = {
  NONE: 'NONE',
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
  UNLIMITED: 'UNLIMITED',
} as const;

export const Belt = {
  WHITE: 'WHITE',
  BLUE: 'BLUE',
  PURPLE: 'PURPLE',
  BROWN: 'BROWN',
  BLACK: 'BLACK',
} as const;

export const AgeCategory = {
  KID: 'KID', // 15 and under
  JUVENILE: 'JUVENILE', // 16-17
  ADULT: 'ADULT', // 18+
} as const;

export const KidsBelt = {
  WHITE: 'WHITE',
  GREY_WHITE: 'GREY_WHITE',
  GREY: 'GREY',
  GREY_BLACK: 'GREY_BLACK',
  YELLOW_WHITE: 'YELLOW_WHITE',
  YELLOW: 'YELLOW',
  YELLOW_BLACK: 'YELLOW_BLACK',
  ORANGE_WHITE: 'ORANGE_WHITE',
  ORANGE: 'ORANGE',
  ORANGE_BLACK: 'ORANGE_BLACK',
  GREEN_WHITE: 'GREEN_WHITE',
  GREEN: 'GREEN',
  GREEN_BLACK: 'GREEN_BLACK',
} as const;

export const EmergencyContactRelationshipToMember = {
  PARENT: 'PARENT',
  GUARDIAN: 'GUARDIAN',
  SPOUSE: 'SPOUSE',
  SIBLING: 'SIBLING',
  OTHER: 'OTHER',
} as const;
