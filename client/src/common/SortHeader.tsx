import { ArrowDownIcon, ArrowUpIcon } from '@/components/Icons';
import { SortOrder } from '@shared/constants/sort';
import { TValidSortField, TSortOrder } from '@shared/types/sort.types';
interface SortHeaderProps {
  label: string;
  field: string;
  currentSort: {
    sortBy: string;
    sortOrder: TSortOrder;
  };
  onSort: (field: TValidSortField) => void;
}

export const SortHeader = ({ label, field, currentSort, onSort }: SortHeaderProps) => (
  <th
    className="py-4 px-2 sm:px-4 font-medium text-black dark:text-white cursor-pointer"
    onClick={() => onSort(field as TValidSortField)}
  >
    <div className="flex items-center">
      <span>{label}</span>
      {currentSort.sortBy === field && (
        <span className="ml-0.5 sm:ml-1">
          {currentSort.sortOrder === SortOrder.ASC ? (
            <ArrowUpIcon className="w-2 h-2 sm:w-3 sm:h-3 text-black dark:text-white" />
          ) : (
            <ArrowDownIcon className="w-2 h-2 sm:w-3 sm:h-3 text-black dark:text-white" />
          )}
        </span>
      )}
    </div>
  </th>
);
