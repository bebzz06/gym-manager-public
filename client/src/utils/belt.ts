import { ValidStripe } from '@/constants/beltImages';
import { BELT_STRIPE_IMAGES } from '@/constants/beltImages';
import { AgeCategory } from '@shared/constants/user';
import { formatToTitleCase } from './string';
import { TAgeCategory } from '@shared/types/user.types';
import { selectOptions } from '@/constants/selectOptions';
import { Belt } from '@shared/constants/user';

// Determine which belt options to use based on age category
export const getBeltOptions = (ageCategory: TAgeCategory) => {
  switch (ageCategory) {
    case AgeCategory.KID:
      return selectOptions.kidsBeltRank;
    case AgeCategory.JUVENILE:
      return selectOptions.juvenileBeltRank;
    case AgeCategory.ADULT:
    default:
      return selectOptions.adultBeltRank;
  }
};
// Helper function to get the correct belt image
export const getBeltImage = (
  belt: keyof typeof BELT_STRIPE_IMAGES,
  stripes: number = 0
): string => {
  // Ensure belt exists in our mapping and stripes is a number
  const normalizedStripes = Number(stripes) || 0;

  if (BELT_STRIPE_IMAGES[belt]?.[normalizedStripes as ValidStripe]) {
    return BELT_STRIPE_IMAGES[belt][normalizedStripes as ValidStripe];
  }

  // Default to white belt (0 stripes) from the environment-specific URLs
  return BELT_STRIPE_IMAGES[Belt.WHITE][0];
};
export const formatBeltRank = (belt: string, stripes: number) => {
  if (stripes === 0) return formatToTitleCase(belt);
  const stripesText = stripes === 1 ? 'One Stripe' : `${stripes} Stripes`;
  return `${stripesText} ${formatToTitleCase(belt)}`;
};
