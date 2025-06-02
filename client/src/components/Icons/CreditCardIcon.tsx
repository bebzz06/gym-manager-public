import React from 'react';
import { IconProps } from '@/types/icon.types';

export const CreditCardIcon: React.FC<IconProps> = ({
  className = 'fill-current',
  width = '18',
  height = '18',
  viewBox = '0 0 20 20',
}) => (
  <svg
    className={className}
    width={width}
    height={height}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.5">
      <path
        d="M19.25 4.95833H2.75C2.05964 4.95833 1.5 5.51797 1.5 6.20833V15.7917C1.5 16.482 2.05964 17.0417 2.75 17.0417H19.25C19.9404 17.0417 20.5 16.482 20.5 15.7917V6.20833C20.5 5.51797 19.9404 4.95833 19.25 4.95833ZM19.25 6.20833V7.45833H2.75V6.20833H19.25ZM2.75 15.7917V8.70833H19.25V15.7917H2.75Z"
        fill=""
      />
      <path
        d="M4.58333 13.2917H8.25C8.59518 13.2917 8.875 13.0119 8.875 12.6667C8.875 12.3215 8.59518 12.0417 8.25 12.0417H4.58333C4.23815 12.0417 3.95833 12.3215 3.95833 12.6667C3.95833 13.0119 4.23815 13.2917 4.58333 13.2917Z"
        fill=""
      />
    </g>
  </svg>
);
