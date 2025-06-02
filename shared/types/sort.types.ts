import { SortFields, SortOrder } from '../constants/sort.js';

export type TValidSortField = (typeof SortFields)[keyof typeof SortFields];
export type TSortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export interface ISortParams {
  sortBy: TValidSortField;
  sortOrder: TSortOrder;
}
