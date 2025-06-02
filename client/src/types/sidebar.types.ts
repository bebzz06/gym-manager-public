import { ReactNode } from 'react';
import { BADGE_VARIANTS } from '@/constants/sidebar';
import { SIDEBAR_MENU_ACCESS } from '@/constants';

export interface ISidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}
export type TBadgeVariant = (typeof BADGE_VARIANTS)[keyof typeof BADGE_VARIANTS];

export interface IMenuItem {
  title: string;
  path: string;
  icon?: ReactNode;
  access?: keyof typeof SIDEBAR_MENU_ACCESS;
  submenu?: IMenuItem[];
  badge?: {
    text: string;
    variant: TBadgeVariant;
  };
}

export interface IMenuGroup {
  title: string;
  items: IMenuItem[];
}
