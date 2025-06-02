import { TBelt, TKidsBelt } from '@shared/types/user.types';

import { IProfileData } from './profile.types';
export interface IProgressInformation {
  rank: { belt: TBelt | TKidsBelt | ''; stripes: number | '' };
}
export interface IPersonalInformation extends IProfileData {}
