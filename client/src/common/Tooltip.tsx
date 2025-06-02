import React from 'react';
import { TooltipPosition } from '@/constants';
import { ITooltipProps, TTooltipPosition } from '@/types/tooltip.types';

const positionStyles: Record<TTooltipPosition, { tooltip: string; arrow: string }> = {
  [TooltipPosition.BOTTOM]: {
    tooltip:
      ' mt-2 absolute left-1/2 -translate-x-1/2 z-20 max-w-[200px] top-full sm:whitespace-nowrap sm:max-w-none rounded bg-black px-4.5 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100',
    arrow: 'absolute top-[-3px] right-1/2 -z-10 h-2 w-2 rounded-sm bg-black rotate-45',
  },
  [TooltipPosition.LEFT]: {
    tooltip:
      'absolute bottom-1/2 z-20 translate-y-1/2 max-w-[200px] right-full sm:whitespace-nowrap sm:max-w-none rounded bg-black px-4.5 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100',
    arrow:
      'absolute right-[-3px] top-1/2 -z-10 h-2 w-2 -translate-y-1/2 rotate-45 rounded-sm bg-black',
  },
  [TooltipPosition.TOP]: {
    tooltip:
      'absolute bottom-full left-1/2 -translate-x-1/2 z-20 mb-2 max-w-[200px] sm:whitespace-nowrap sm:max-w-none rounded bg-black px-4.5 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100',
    arrow: 'absolute bottom-[-3px] left-1/2 -z-10 h-2 w-2 rotate-45 rounded-sm bg-black',
  },
};

export const Tooltip: React.FC<ITooltipProps> = ({
  message,
  children,
  position = TooltipPosition.LEFT,
}) => {
  const positionStyle = positionStyles[position];
  return (
    <div className="group relative">
      {children}
      <div className={positionStyle.tooltip}>
        <span className={positionStyle.arrow}></span>
        {message}
      </div>
    </div>
  );
};
