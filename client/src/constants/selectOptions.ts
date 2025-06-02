import {
  Belt,
  KidsBelt,
  EmergencyContactRelationshipToMember,
  UserRole,
} from '@shared/constants/user';
import { formatToTitleCase } from '@/utils';
import { PaymentTransactionTypes } from '@shared/constants/payment';

export const selectOptions = {
  adultBeltRank: Object.values(Belt).map(belt => ({
    value: belt,
    label: formatToTitleCase(belt),
  })),
  kidsBeltRank: Object.values(KidsBelt).map(kidsBelt => ({
    value: kidsBelt,
    label: formatToTitleCase(kidsBelt),
  })),
  juvenileBeltRank: [Belt.WHITE, Belt.BLUE].map(juvenileBelt => ({
    value: juvenileBelt,
    label: formatToTitleCase(juvenileBelt),
  })),
  emergencyContactRelationshipToMember: Object.values(EmergencyContactRelationshipToMember).map(
    emergencyContactRelationshipToMember => ({
      value: emergencyContactRelationshipToMember,
      label: formatToTitleCase(emergencyContactRelationshipToMember),
    })
  ),
  paymentTransactionTypes: Object.values(PaymentTransactionTypes).map(type => ({
    value: type,
    label: formatToTitleCase(type),
  })),
  stripes: [
    { value: '0', label: '0' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
  ],
  allowedRoleChanges: Object.values(UserRole)
    .filter(role => role !== UserRole.OWNER)
    .map(role => ({
      value: role,
      label: role.charAt(0) + role.slice(1).toLowerCase(),
    })),
};
