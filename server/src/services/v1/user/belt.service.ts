import { IUser } from '@/types/user.types.js';
import { AgeCategory, Belt, KidsBelt } from '@shared/constants/user.js';
import { TBelt, TKidsBelt } from '@shared/types/user.types.js';

export const validateBeltForAgeCategory = (
  user: IUser
): {
  isValid: boolean;
  defaultBelt: TBelt | TKidsBelt;
} => {
  const ageCategory = user.getAgeCategory();
  const currentBelt = user.rank.belt;

  let validBelts: (TBelt | TKidsBelt)[];

  if (ageCategory === AgeCategory.KID) {
    validBelts = Object.values(KidsBelt);
  } else if (ageCategory === AgeCategory.JUVENILE) {
    validBelts = [...Object.values(KidsBelt), ...Object.values(Belt)];
  } else {
    validBelts = Object.values(Belt);
  }

  const defaultBelt = ageCategory === AgeCategory.KID ? KidsBelt.WHITE : Belt.WHITE;

  return {
    isValid: validBelts.includes(currentBelt),
    defaultBelt,
  };
};
