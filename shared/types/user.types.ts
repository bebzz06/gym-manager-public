import {
  UserRole,
  MembershipStatus,
  MembershipType,
  Belt,
  KidsBelt,
  AgeCategory,
  EmergencyContactRelationshipToMember,
} from '../constants/user.js';

export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

export type TMembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export type TMembershipType = (typeof MembershipType)[keyof typeof MembershipType];

export type TBelt = (typeof Belt)[keyof typeof Belt];

export type TKidsBelt = (typeof KidsBelt)[keyof typeof KidsBelt];

export type TAgeCategory = (typeof AgeCategory)[keyof typeof AgeCategory];

export type TEmergencyContactRelationshipToMember =
  (typeof EmergencyContactRelationshipToMember)[keyof typeof EmergencyContactRelationshipToMember];
