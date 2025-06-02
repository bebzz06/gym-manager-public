import { TooltipPosition } from '@/constants';

export type TTooltipPosition = (typeof TooltipPosition)[keyof typeof TooltipPosition];

export interface ITooltipProps {
  message: string | React.ReactNode;
  children: React.ReactNode;
  position?: TTooltipPosition;
}
