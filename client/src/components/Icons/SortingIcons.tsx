import { IconProps } from '@/types/icon.types';

export const ArrowUpIcon = ({ className }: IconProps) => (
  <svg
    className={`w-4 h-4 inline-block text-black dark:text-white ${className}`}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 4l-8 8h16z" />
  </svg>
);

export const ArrowDownIcon = ({ className }: IconProps) => (
  <svg
    className={`w-4 h-4 inline-block text-black dark:text-white ${className}`}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 20l-8-8h16z" />
  </svg>
);
