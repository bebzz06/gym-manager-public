import { Belt, KidsBelt } from '@shared/constants/user';

import { TBelt, TKidsBelt } from '@shared/types/user.types';

export type ValidStripe = 0 | 1 | 2 | 3 | 4;

const getBeltImages = async () => {
  const env = (import.meta.env.MODE || 'development') as 'development' | 'staging' | 'production';

  const beltImageUrls = await import(`./beltImagesUrls/beltImageUrls.${env}.json`);

  return beltImageUrls;
};

const beltImageUrls = await getBeltImages();

export const BELT_STRIPE_IMAGES: Record<TBelt | TKidsBelt, Record<ValidStripe, string>> = {
  [Belt.WHITE]: {
    0: beltImageUrls.WHITE['0'],
    1: beltImageUrls.WHITE['1'],
    2: beltImageUrls.WHITE['2'],
    3: beltImageUrls.WHITE['3'],
    4: beltImageUrls.WHITE['4'],
  },
  [Belt.BLUE]: {
    0: beltImageUrls.BLUE['0'],
    1: beltImageUrls.BLUE['1'],
    2: beltImageUrls.BLUE['2'],
    3: beltImageUrls.BLUE['3'],
    4: beltImageUrls.BLUE['4'],
  },
  [Belt.PURPLE]: {
    0: beltImageUrls.PURPLE['0'],
    1: beltImageUrls.PURPLE['1'],
    2: beltImageUrls.PURPLE['2'],
    3: beltImageUrls.PURPLE['3'],
    4: beltImageUrls.PURPLE['4'],
  },
  [Belt.BROWN]: {
    0: beltImageUrls.BROWN['0'],
    1: beltImageUrls.BROWN['1'],
    2: beltImageUrls.BROWN['2'],
    3: beltImageUrls.BROWN['3'],
    4: beltImageUrls.BROWN['4'],
  },
  [Belt.BLACK]: {
    0: beltImageUrls.BLACK['0'],
    1: beltImageUrls.BLACK['1'],
    2: beltImageUrls.BLACK['2'],
    3: beltImageUrls.BLACK['3'],
    4: beltImageUrls.BLACK['4'],
  },
  // Kids belts
  [KidsBelt.GREY_WHITE]: {
    0: beltImageUrls.GRAY_WHITE['0'],
    1: beltImageUrls.GRAY_WHITE['1'],
    2: beltImageUrls.GRAY_WHITE['2'],
    3: beltImageUrls.GRAY_WHITE['3'],
    4: beltImageUrls.GRAY_WHITE['4'],
  },
  [KidsBelt.GREY]: {
    0: beltImageUrls.GRAY['0'],
    1: beltImageUrls.GRAY['1'],
    2: beltImageUrls.GRAY['2'],
    3: beltImageUrls.GRAY['3'],
    4: beltImageUrls.GRAY['4'],
  },
  [KidsBelt.GREY_BLACK]: {
    0: beltImageUrls.GRAY_BLACK['0'],
    1: beltImageUrls.GRAY_BLACK['1'],
    2: beltImageUrls.GRAY_BLACK['2'],
    3: beltImageUrls.GRAY_BLACK['3'],
    4: beltImageUrls.GRAY_BLACK['4'],
  },
  [KidsBelt.YELLOW_WHITE]: {
    0: beltImageUrls.YELLOW_WHITE['0'],
    1: beltImageUrls.YELLOW_WHITE['1'],
    2: beltImageUrls.YELLOW_WHITE['2'],
    3: beltImageUrls.YELLOW_WHITE['3'],
    4: beltImageUrls.YELLOW_WHITE['4'],
  },
  [KidsBelt.YELLOW]: {
    0: beltImageUrls.YELLOW['0'],
    1: beltImageUrls.YELLOW['1'],
    2: beltImageUrls.YELLOW['2'],
    3: beltImageUrls.YELLOW['3'],
    4: beltImageUrls.YELLOW['4'],
  },
  [KidsBelt.YELLOW_BLACK]: {
    0: beltImageUrls.YELLOW_BLACK['0'],
    1: beltImageUrls.YELLOW_BLACK['1'],
    2: beltImageUrls.YELLOW_BLACK['2'],
    3: beltImageUrls.YELLOW_BLACK['3'],
    4: beltImageUrls.YELLOW_BLACK['4'],
  },
  [KidsBelt.ORANGE_WHITE]: {
    0: beltImageUrls.ORANGE_WHITE['0'],
    1: beltImageUrls.ORANGE_WHITE['1'],
    2: beltImageUrls.ORANGE_WHITE['2'],
    3: beltImageUrls.ORANGE_WHITE['3'],
    4: beltImageUrls.ORANGE_WHITE['4'],
  },
  [KidsBelt.ORANGE]: {
    0: beltImageUrls.ORANGE['0'],
    1: beltImageUrls.ORANGE['1'],
    2: beltImageUrls.ORANGE['2'],
    3: beltImageUrls.ORANGE['3'],
    4: beltImageUrls.ORANGE['4'],
  },
  [KidsBelt.ORANGE_BLACK]: {
    0: beltImageUrls.ORANGE_BLACK['0'],
    1: beltImageUrls.ORANGE_BLACK['1'],
    2: beltImageUrls.ORANGE_BLACK['2'],
    3: beltImageUrls.ORANGE_BLACK['3'],
    4: beltImageUrls.ORANGE_BLACK['4'],
  },
  [KidsBelt.GREEN_WHITE]: {
    0: beltImageUrls.GREEN_WHITE['0'],
    1: beltImageUrls.GREEN_WHITE['1'],
    2: beltImageUrls.GREEN_WHITE['2'],
    3: beltImageUrls.GREEN_WHITE['3'],
    4: beltImageUrls.GREEN_WHITE['4'],
  },
  [KidsBelt.GREEN]: {
    0: beltImageUrls.GREEN['0'],
    1: beltImageUrls.GREEN['1'],
    2: beltImageUrls.GREEN['2'],
    3: beltImageUrls.GREEN['3'],
    4: beltImageUrls.GREEN['4'],
  },
  [KidsBelt.GREEN_BLACK]: {
    0: beltImageUrls.GREEN_BLACK['0'],
    1: beltImageUrls.GREEN_BLACK['1'],
    2: beltImageUrls.GREEN_BLACK['2'],
    3: beltImageUrls.GREEN_BLACK['3'],
    4: beltImageUrls.GREEN_BLACK['4'],
  },
};
